<script lang="ts">
	import { base } from '$app/paths';
	import { settings } from '$lib/stores/settings';
	import type { ChapterMeta } from '$lib/stores/chapters';

	interface Props {
		chapters: ChapterMeta[];
		currentSlug?: string;
		open?: boolean;
	}

	let { chapters, currentSlug = '', open = false }: Props = $props();

	let searchQuery = $state('');

	const filtered = $derived(
		searchQuery.trim()
			? chapters.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
			: chapters
	);

	// Group by arc
	const grouped = $derived.by(() => {
		const map = new Map<string, ChapterMeta[]>();
		for (const ch of filtered) {
			const arc = ch.arc ?? 'Uncategorized';
			if (!map.has(arc)) map.set(arc, []);
			map.get(arc)!.push(ch);
		}
		return map;
	});
</script>

<aside
	class="w-72 shrink-0 border-r border-base-300 h-screen sticky top-0 overflow-y-auto flex flex-col"
	class:hidden={!open}
>
	<div class="p-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
		<h2 class="font-bold text-lg mb-3">Table of Contents</h2>
		<input
			type="search"
			placeholder="Search chapters…"
			bind:value={searchQuery}
			class="input input-bordered input-sm w-full"
		/>
	</div>

	<nav class="p-2 flex-1">
		{#each [...grouped] as [arc, arcChapters]}
			<details open class="mb-1">
				<summary class="cursor-pointer px-2 py-1 rounded font-semibold text-sm opacity-70 hover:opacity-100 select-none">
					{arc}
				</summary>
				<ul class="ml-2 mt-1 space-y-0.5">
					{#each arcChapters as chapter}
						{@const progress = $settings.readingProgress[chapter.slug] ?? 0}
						<li>
							<a
								href="{base}/chapter/{chapter.slug}"
								class="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-base-200 transition-colors"
								class:bg-primary={chapter.slug === currentSlug}
								class:text-primary-content={chapter.slug === currentSlug}
							>
								<span class="truncate flex-1">{chapter.title}</span>
								{#if progress > 0}
									<span
										class="shrink-0 text-xs opacity-50"
										title="{progress}% read"
									>
										{#if progress >= 95}✓{:else}{progress}%{/if}
									</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</details>
		{/each}

		{#if filtered.length === 0}
			<p class="text-center opacity-50 py-8 text-sm">No chapters found.</p>
		{/if}
	</nav>
</aside>
