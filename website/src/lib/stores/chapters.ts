import { writable, derived } from 'svelte/store';

export interface ChapterMeta {
	slug: string;
	title: string;
	number: number;
	arc?: string;
	wordCount?: number;
	path: string;
}

export interface Metadata {
	title: string;
	author: string;
	description: string;
	totalChapters: number;
	chapters: ChapterMeta[];
}

function createChaptersStore() {
	const { subscribe, set } = writable<Metadata | null>(null);

	async function load(basePath = '') {
		try {
			const res = await fetch(`${basePath}/chapters/metadata.json`);
			if (!res.ok) throw new Error('Failed to load metadata');
			const data: Metadata = await res.json();
			set(data);
		} catch (err) {
			console.error(
				`Could not load chapter metadata from ${basePath}/chapters/metadata.json. ` +
				'Ensure the EPUB has been processed with: node scripts/process-epub.js',
				err
			);
			set(null);
		}
	}

	return { subscribe, load };
}

export const chaptersStore = createChaptersStore();

export const chapterList = derived(chaptersStore, ($meta) => $meta?.chapters ?? []);
