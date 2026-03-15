import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export const THEME_OPTIONS = [
	'sunset', 'dark', 'dracula', 'night', 'coffee',
	'dim', 'light', 'cupcake', 'nord', 'business'
] as const;

export const FONT_OPTIONS = [
	{ label: 'Alegreya', value: "'Alegreya', serif" },
	{ label: 'EB Garamond', value: "'EB Garamond', serif" },
	{ label: 'Crimson Pro', value: "'Crimson Pro', serif" },
	{ label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
	{ label: 'System Sans', value: 'system-ui, -apple-system, sans-serif' }
] as const;

export interface Settings {
	theme: string;
	fontSize: number;
	fontFamily: string;
	lineHeight: number;
	fontWeight: number;
	textAlign: TextAlign;
	indent: boolean;
	hyphenation: boolean;
	stickyNavbar: boolean;
	showComments: boolean;
	readingProgress: Record<string, number>;
	lastReadChapter: string | null;
}

const defaultSettings: Settings = {
	theme: 'sunset',
	fontSize: 18,
	fontFamily: "'Alegreya', serif",
	lineHeight: 1.9,
	fontWeight: 400,
	textAlign: 'left',
	indent: true,
	hyphenation: false,
	stickyNavbar: true,
	showComments: true,
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
		setTheme(theme: string) {
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
		setFontFamily(family: string) {
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
		setFontWeight(weight: number) {
			update((s) => {
				const next = { ...s, fontWeight: weight };
				save(next);
				return next;
			});
		},
		setTextAlign(align: TextAlign) {
			update((s) => {
				const next = { ...s, textAlign: align };
				save(next);
				return next;
			});
		},
		setIndent(indent: boolean) {
			update((s) => {
				const next = { ...s, indent };
				save(next);
				return next;
			});
		},
		setHyphenation(hyphenation: boolean) {
			update((s) => {
				const next = { ...s, hyphenation };
				save(next);
				return next;
			});
		},
		setStickyNavbar(sticky: boolean) {
			update((s) => {
				const next = { ...s, stickyNavbar: sticky };
				save(next);
				return next;
			});
		},
		setShowComments(show: boolean) {
			update((s) => {
				const next = { ...s, showComments: show };
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
			const theme = defaultSettings.theme;
			set(defaultSettings);
			if (browser) {
				localStorage.removeItem('ss-reader-settings');
				document.documentElement.setAttribute('data-theme', theme);
			}
		}
	};
}

export const settings = createSettingsStore();
