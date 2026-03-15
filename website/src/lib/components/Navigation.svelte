<script lang="ts">
	import { base } from '$app/paths';
	import type { ChapterMeta } from '$lib/stores/chapters';

	interface Props {
		prev: ChapterMeta | null;
		next: ChapterMeta | null;
		current: ChapterMeta;
	}

	let { prev, next, current }: Props = $props();
</script>

<nav class="flex items-center justify-between py-6 gap-4 flex-wrap">
	{#if prev}
		<a
			href="{base}/chapter/{prev.slug}"
			class="btn btn-outline btn-sm flex-1 min-w-0 max-w-xs truncate"
			title={prev.title}
		>
			← {prev.title}
		</a>
	{:else}
		<div class="flex-1 max-w-xs"></div>
	{/if}

	<a href="{base}/" class="btn btn-ghost btn-sm">☰ Table of Contents</a>

	{#if next}
		<a
			href="{base}/chapter/{next.slug}"
			class="btn btn-outline btn-sm flex-1 min-w-0 max-w-xs truncate text-right"
			title={next.title}
		>
			{next.title} →
		</a>
	{:else}
		<div class="flex-1 max-w-xs"></div>
	{/if}
</nav>

<div class="text-center text-sm opacity-60 pb-2">
	Chapter {current.number}{#if current.arc}&nbsp;·&nbsp;{current.arc}{/if}
</div>
