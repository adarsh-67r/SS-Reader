#!/usr/bin/env node
/**
 * process-epub.js
 * Extracts chapters from shadow-slave.epub (in repo root) to chapters/
 * Usage: node scripts/process-epub.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EPUB_PATH = join(ROOT, 'Shadow Slave.epub');
const CHAPTERS_DIR = join(ROOT, 'chapters');

// Slug helper
function toSlug(str) {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

// Convert HTML to Markdown (basic)
function htmlToMarkdown(html) {
	return html
		// Remove style/script tags
		.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
		.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
		// Headings
		.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `# ${cleanText(t)}\n\n`)
		.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `## ${cleanText(t)}\n\n`)
		.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `### ${cleanText(t)}\n\n`)
		// Bold / italic
		.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
		.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
		.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
		.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
		// Paragraph breaks
		.replace(/<\/p>/gi, '\n\n')
		.replace(/<br\s*\/?>/gi, '\n')
		// Horizontal rules
		.replace(/<hr[^>]*>/gi, '\n---\n')
		// Strip remaining tags
		.replace(/<[^>]+>/g, '')
		// Decode HTML entities
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/&#x200B;/g, '')
		// Collapse extra blank lines (max 2)
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function cleanText(html) {
	return html.replace(/<[^>]+>/g, '').trim();
}

// Count words in markdown text
function wordCount(text) {
	return text.trim().split(/\s+/).filter(Boolean).length;
}

// Extract text value from XML element that may be an object or string
function extractText(value) {
	if (!value) return '';
	if (typeof value === 'string') return value;
	if (typeof value === 'object') {
		// fast-xml-parser puts text content in '#text' when there are attributes
		if (value['#text']) return String(value['#text']);
		// Or it might be the value itself
		return JSON.stringify(value);
	}
	return String(value);
}

async function main() {
	if (!existsSync(EPUB_PATH)) {
		console.error(`❌ EPUB not found at: ${EPUB_PATH}`);
		console.error('   Please place "Shadow Slave.epub" in the root of the repository.');
		process.exit(1);
	}

	console.log(`📖 Reading EPUB: ${EPUB_PATH}`);
	const zip = new AdmZip(EPUB_PATH);
	const entries = zip.getEntries();

	// Parse container.xml to find OPF path
	const containerEntry = entries.find((e) => e.entryName === 'META-INF/container.xml');
	if (!containerEntry) throw new Error('Invalid EPUB: missing META-INF/container.xml');

	const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
	const container = parser.parse(containerEntry.getData().toString('utf8'));
	const opfPath =
		container?.container?.rootfiles?.rootfile?.['@_full-path'] ??
		container?.container?.rootfiles?.rootfile?.[0]?.['@_full-path'];

	if (!opfPath) throw new Error('Cannot find OPF path in container.xml');
	console.log(`📄 OPF file: ${opfPath}`);

	const opfEntry = entries.find((e) => e.entryName === opfPath);
	if (!opfEntry) throw new Error(`OPF file not found in EPUB: ${opfPath}`);

	const opf = parser.parse(opfEntry.getData().toString('utf8'));
	const pkg = opf?.package ?? opf?.['opf:package'] ?? opf;

	// Build manifest map: id -> href
	const manifestItems = pkg?.manifest?.item ?? pkg?.['opf:manifest']?.['opf:item'] ?? [];
	const items = Array.isArray(manifestItems) ? manifestItems : [manifestItems];
	const manifest = new Map();
	for (const item of items) {
		const id = item['@_id'];
		const href = item['@_href'];
		if (id && href) manifest.set(id, href);
	}

	// Get spine order
	const spineItems =
		pkg?.spine?.itemref ?? pkg?.['opf:spine']?.['opf:itemref'] ?? [];
	const spine = Array.isArray(spineItems) ? spineItems : [spineItems];
	const orderedIds = spine
		.map((i) => i['@_idref'])
		.filter(Boolean);

	// Get metadata
	const dcTitle =
		pkg?.metadata?.['dc:title'] ??
		pkg?.['opf:metadata']?.['dc:title'] ??
		'Shadow Slave';
	const dcAuthor =
		pkg?.metadata?.['dc:creator'] ??
		pkg?.['opf:metadata']?.['dc:creator'] ??
		'Guiltythree';
	const bookTitle = extractText(Array.isArray(dcTitle) ? dcTitle[0] : dcTitle);
	const bookAuthor = extractText(Array.isArray(dcAuthor) ? dcAuthor[0] : dcAuthor);

	// Base dir for EPUB content
	const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

	console.log(`\n📚 Found ${orderedIds.length} items in spine`);
	mkdirSync(CHAPTERS_DIR, { recursive: true });

	const chapters = [];
	let chapterNumber = 0;

	for (const id of orderedIds) {
		const href = manifest.get(id);
		if (!href) continue;

		const fullPath = opfDir + href;
		const entry = entries.find(
			(e) => e.entryName === fullPath || e.entryName === decodeURIComponent(fullPath)
		);
		if (!entry) {
			console.warn(`  ⚠️  Entry not found: ${fullPath}`);
			continue;
		}

		const htmlContent = entry.getData().toString('utf8');
		const markdown = htmlToMarkdown(htmlContent);

		if (markdown.length < 100) continue; // skip empty/nav pages

		chapterNumber++;

		// Try to extract chapter title from first heading or content
		const titleMatch = markdown.match(/^#+ (.+)/m);
		let title = titleMatch ? titleMatch[1].trim() : `Chapter ${chapterNumber}`;

		// Remove the title from content body to avoid duplication
		const body = titleMatch
			? markdown.replace(titleMatch[0], '').trim()
			: markdown;

		const slug = toSlug(`chapter-${chapterNumber}-${title.slice(0, 40)}`);
		const filename = `${slug}.md`;
		const wc = wordCount(body);

		const frontmatter = [
			'---',
			`title: "${title.replace(/"/g, '\\"')}"`,
			`number: ${chapterNumber}`,
			`slug: "${slug}"`,
			`wordCount: ${wc}`,
			'---',
			''
		].join('\n');

		writeFileSync(join(CHAPTERS_DIR, filename), frontmatter + body + '\n');

		chapters.push({
			slug,
			title,
			number: chapterNumber,
			wordCount: wc,
			path: filename
		});

		if (chapterNumber % 50 === 0) {
			process.stdout.write(`  ✓ Processed ${chapterNumber} chapters...\n`);
		}
	}

	// Write metadata.json
	const metadata = {
		title: bookTitle,
		author: bookAuthor,
		description: `Read ${bookTitle} online with a clean, distraction-free reader.`,
		totalChapters: chapters.length,
		generatedAt: new Date().toISOString(),
		chapters
	};

	writeFileSync(join(CHAPTERS_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');

	console.log(`\n✅ Done! Extracted ${chapters.length} chapters to ${CHAPTERS_DIR}`);
	console.log(`📋 Metadata written to chapters/metadata.json`);
}

main().catch((err) => {
	console.error('❌ Error:', err.message);
	process.exit(1);
});
