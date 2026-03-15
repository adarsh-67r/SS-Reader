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
	class="prose prose-lg max-w-none mx-auto chapter-content"
	style:--chapter-font={$settings.fontFamily}
	style:--chapter-size="{$settings.fontSize}px"
	style:--chapter-lh={$settings.lineHeight}
	style:--chapter-weight={$settings.fontWeight}
	style:--chapter-align={$settings.textAlign}
	style:--chapter-hyphens={$settings.hyphenation ? 'auto' : 'none'}
	style:--chapter-indent={$settings.indent ? '1.5em' : '0'}
>
	{@html content}
</article>
