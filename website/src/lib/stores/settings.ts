import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Settings {
	theme: 'light' | 'dark';
	fontSize: number;
	fontFamily: 'serif' | 'sans';
	lineHeight: number;
	readingProgress: Record<string, number>;
	lastReadChapter: string | null;
}

const defaultSettings: Settings = {
	theme: 'dark',
	fontSize: 18,
	fontFamily: 'serif',
	lineHeight: 1.9,
	readingProgress: {},
	lastReadChapter: null
};

function loadSettings(): Settings {
	if (!browser) return defaultSettings;
	try {
		const stored = localStorage.getItem('ss-reader-settings');
		if (stored) {
			return { ...defaultSettings, ...JSON.parse(stored) };
		}
	} catch {
		// ignore
	}
	return defaultSettings;
}

function createSettingsStore() {
	const { subscribe, set, update } = writable<Settings>(loadSettings());

	function save(settings: Settings) {
		if (browser) {
			localStorage.setItem('ss-reader-settings', JSON.stringify(settings));
		}
	}

	return {
		subscribe,
		setTheme(theme: 'light' | 'dark') {
			update((s) => {
				const next = { ...s, theme };
				save(next);
				if (browser) document.documentElement.setAttribute('data-theme', theme);
				return next;
			});
		},
		setFontSize(size: number) {
			update((s) => {
				const next = { ...s, fontSize: size };
				save(next);
				return next;
			});
		},
		setFontFamily(family: 'serif' | 'sans') {
			update((s) => {
				const next = { ...s, fontFamily: family };
				save(next);
				return next;
			});
		},
		setLineHeight(lh: number) {
			update((s) => {
				const next = { ...s, lineHeight: lh };
				save(next);
				return next;
			});
		},
		updateProgress(slug: string, percent: number) {
			update((s) => {
				const next = {
					...s,
					readingProgress: { ...s.readingProgress, [slug]: percent },
					lastReadChapter: slug
				};
				save(next);
				return next;
			});
		},
		reset() {
			set(defaultSettings);
			if (browser) localStorage.removeItem('ss-reader-settings');
		}
	};
}

export const settings = createSettingsStore();
