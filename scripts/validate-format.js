#!/usr/bin/env node
/**
 * validate-format.js
 * Validates that chapter markdown files conform to expected formatting.
 * Usage: node scripts/validate-format.js
 */

import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHAPTERS_DIR = join(ROOT, 'chapters');

let errors = 0;
let warnings = 0;

function parseFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	return match ? match[1] : null;
}

function validate(file, content) {
	const issues = [];

	// 1. Must have frontmatter
	const fm = parseFrontmatter(content);
	if (!fm) {
		issues.push({ level: 'error', msg: 'Missing YAML frontmatter (--- ... ---)' });
		errors++;
		return issues;
	}

	// 2. Required frontmatter fields
	const requiredFields = ['title', 'number', 'slug'];
	for (const field of requiredFields) {
		if (!fm.includes(`${field}:`)) {
			issues.push({ level: 'error', msg: `Missing required frontmatter field: "${field}"` });
			errors++;
		}
	}

	// 3. Content after frontmatter
	const body = content.replace(/^---[\s\S]*?---\n?/, '').trim();
	if (body.length < 50) {
		issues.push({ level: 'warning', msg: 'Chapter body is very short (< 50 chars)' });
		warnings++;
	}

	// 4. No raw HTML tags in body (should be clean markdown)
	const htmlTags = body.match(/<[a-z][^>]*>/gi);
	if (htmlTags && htmlTags.length > 5) {
		issues.push({
			level: 'warning',
			msg: `Found ${htmlTags.length} HTML tags in chapter body. Consider converting to Markdown.`
		});
		warnings++;
	}

	// 5. Slug matches filename
	const slugMatch = fm.match(/slug:\s*"?([^"\n]+)"?/);
	if (slugMatch) {
		const expectedFile = `${slugMatch[1].trim()}.md`;
		if (file !== expectedFile) {
			issues.push({
				level: 'warning',
				msg: `Slug "${slugMatch[1].trim()}" doesn't match filename "${file}" (expected "${expectedFile}")`
			});
			warnings++;
		}
	}

	return issues;
}

function main() {
	const files = readdirSync(CHAPTERS_DIR)
		.filter((f) => f.endsWith('.md'))
		.sort();

	if (files.length === 0) {
		console.log('⚠️  No markdown files found in chapters/');
		process.exit(0);
	}

	console.log(`🔍 Validating ${files.length} chapter files...\n`);

	for (const file of files) {
		const content = readFileSync(join(CHAPTERS_DIR, file), 'utf8');
		const issues = validate(file, content);

		if (issues.length > 0) {
			console.log(`📄 ${file}`);
			for (const issue of issues) {
				const icon = issue.level === 'error' ? '  ❌' : '  ⚠️ ';
				console.log(`${icon} ${issue.msg}`);
			}
			console.log('');
		}
	}

	console.log('─'.repeat(50));
	if (errors > 0 || warnings > 0) {
		console.log(`Results: ${errors} error(s), ${warnings} warning(s)`);
	} else {
		console.log(`✅ All ${files.length} chapters are valid!`);
	}

	if (errors > 0) process.exit(1);
}

main();
