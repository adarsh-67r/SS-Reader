#!/usr/bin/env node
/**
 * generate-index.js
 * Re-generates chapters/metadata.json from existing markdown chapter files.
 * Useful if you've manually edited chapter files and want to rebuild the index.
 * Usage: node scripts/generate-index.js
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHAPTERS_DIR = join(ROOT, 'chapters');

function parseFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};
	const fm = {};
	for (const line of match[1].split('\n')) {
		const colonIdx = line.indexOf(':');
		if (colonIdx === -1) continue;
		const key = line.slice(0, colonIdx).trim();
		let value = line.slice(colonIdx + 1).trim();
		// Remove surrounding quotes
		if ((value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}
		// Try to parse numbers
		if (!isNaN(Number(value)) && value !== '') {
			fm[key] = Number(value);
		} else {
			fm[key] = value;
		}
	}
	return fm;
}

function wordCount(text) {
	const body = text.replace(/^---[\s\S]*?---\n?/, '');
	return body.trim().split(/\s+/).filter(Boolean).length;
}

async function main() {
	const files = readdirSync(CHAPTERS_DIR)
		.filter((f) => f.endsWith('.md'))
		.sort();

	if (files.length === 0) {
		console.error('❌ No markdown files found in chapters/');
		console.error('   Run node scripts/process-epub.js first.');
		process.exit(1);
	}

	const chapters = [];

	for (const file of files) {
		const content = readFileSync(join(CHAPTERS_DIR, file), 'utf8');
		const fm = parseFrontmatter(content);
		const wc = fm.wordCount ?? wordCount(content);

		chapters.push({
			slug: fm.slug ?? file.replace('.md', ''),
			title: fm.title ?? file.replace('.md', ''),
			number: fm.number ?? chapters.length + 1,
			...(fm.arc ? { arc: fm.arc } : {}),
			wordCount: wc,
			path: file
		});
	}

	// Sort by chapter number
	chapters.sort((a, b) => a.number - b.number);

	// Try to preserve existing metadata for title/author/description
	let existing = {};
	try {
		existing = JSON.parse(readFileSync(join(CHAPTERS_DIR, 'metadata.json'), 'utf8'));
	} catch {
		// ignore
	}

	const metadata = {
		title: existing.title ?? 'Shadow Slave',
		author: existing.author ?? 'Guiltythree',
		description:
			existing.description ??
			'Read Shadow Slave online with a clean, distraction-free reader.',
		totalChapters: chapters.length,
		generatedAt: new Date().toISOString(),
		chapters
	};

	writeFileSync(join(CHAPTERS_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
	console.log(`✅ Generated metadata.json with ${chapters.length} chapters.`);
}

main().catch((err) => {
	console.error('❌ Error:', err.message);
	process.exit(1);
});
