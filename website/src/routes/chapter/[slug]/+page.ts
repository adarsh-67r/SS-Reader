import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { marked } from 'marked';

export const prerender = false;

export const load: PageLoad = async ({ params, fetch }) => {
	const { slug } = params;

	// Load metadata
	const metaRes = await fetch(`${base}/chapters/metadata.json`);
	if (!metaRes.ok) {
		throw error(404, 'Chapter metadata not found. Run node scripts/process-epub.js first.');
	}
	const metadata = await metaRes.json();

	const chapters = metadata.chapters as Array<{
		slug: string;
		title: string;
		number: number;
		arc?: string;
		wordCount?: number;
		path: string;
	}>;

	const index = chapters.findIndex((c) => c.slug === slug);
	if (index === -1) {
		throw error(404, `Chapter "${slug}" not found.`);
	}

	const chapter = chapters[index];

	// Load chapter markdown content
	const contentRes = await fetch(`${base}/chapters/${chapter.path}`);
	if (!contentRes.ok) {
		throw error(404, `Chapter content not found: ${chapter.path}`);
	}
	const rawContent = await contentRes.text();

	// Strip frontmatter (--- ... ---)
	const stripped = rawContent.replace(/^---[\s\S]*?---\n?/, '');

	// Convert markdown to HTML
	const htmlContent = await marked.parse(stripped);

	return {
		chapter,
		content: htmlContent,
		prev: index > 0 ? chapters[index - 1] : null,
		next: index < chapters.length - 1 ? chapters[index + 1] : null,
		allChapters: chapters,
		metadata
	};
};
