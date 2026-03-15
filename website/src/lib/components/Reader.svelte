<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { settings } from '$lib/stores/settings';

	interface Props {
		content: string;
		slug: string;
	}

	let { content, slug }: Props = $props();

	let progressBar: HTMLDivElement | undefined;
	let articleEl: HTMLElement | undefined;

	function updateProgress() {
		if (!articleEl || !progressBar) return;
		const rect = articleEl.getBoundingClientRect();
		const total = articleEl.scrollHeight - window.innerHeight;
		const scrolled = Math.max(0, -rect.top);
		const percent = total > 0 ? Math.min(100, (scrolled / total) * 100) : 100;
		progressBar.style.width = `${percent}%`;
		settings.updateProgress(slug, Math.round(percent));
	}

	onMount(() => {
		window.addEventListener('scroll', updateProgress, { passive: true });
		updateProgress();
	});

	onDestroy(() => {
		window.removeEventListener('scroll', updateProgress);
	});
</script>

<div id="reading-progress" bind:this={progressBar}></div>

<article
	bind:this={articleEl}
	class="prose prose-lg max-w-none mx-auto px-4"
	style:font-size="{$settings.fontSize}px"
	style:line-height={$settings.lineHeight}
	style:font-family={$settings.fontFamily === 'serif'
		? "Georgia, 'Times New Roman', serif"
		: 'system-ui, sans-serif'}
>
	{@html content}
</article>
