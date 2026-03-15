<script lang="ts">
	import { base } from '$app/paths';
	import type { ChapterMeta } from '$lib/stores/chapters';
	import Icon from '@iconify/svelte';

	interface Props {
		prev: ChapterMeta | null;
		next: ChapterMeta | null;
		current: ChapterMeta;
	}

	let { prev, next, current }: Props = $props();
</script>

<nav class="flex items-center justify-between py-4 gap-3">
	{#if prev}
		<a
			href="{base}/chapter/{prev.slug}"
			class="btn btn-outline btn-sm flex-1 min-w-0 max-w-xs gap-2"
			title={prev.title}
		>
			<Icon icon="mdi:chevron-left" width="18" class="shrink-0" />
			<span class="truncate">{prev.title}</span>
		</a>
	{:else}
		<div class="flex-1 max-w-xs"></div>
	{/if}

	<div class="text-center shrink-0">
		<span class="text-xs opacity-50 font-mono">Ch. {current.number}</span>
	</div>

	{#if next}
		<a
			href="{base}/chapter/{next.slug}"
			class="btn btn-outline btn-sm flex-1 min-w-0 max-w-xs gap-2 justify-end"
			title={next.title}
		>
			<span class="truncate">{next.title}</span>
			<Icon icon="mdi:chevron-right" width="18" class="shrink-0" />
		</a>
	{:else}
		<div class="flex-1 max-w-xs"></div>
	{/if}
</nav>

{#if current.arc}
	<div class="text-center text-xs opacity-40 pb-1">{current.arc}</div>
{/if}
