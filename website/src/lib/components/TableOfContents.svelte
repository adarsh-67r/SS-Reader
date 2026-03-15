<script lang="ts">
	import { base } from '$app/paths';
	import { settings } from '$lib/stores/settings';
	import { tocOpen } from '$lib/stores/ui';
	import type { ChapterMeta } from '$lib/stores/chapters';
	import Icon from '@iconify/svelte';
	import { tick } from 'svelte';

	interface Props {
		chapters: ChapterMeta[];
		currentSlug?: string;
		open?: boolean;
	}

	let { chapters, currentSlug = '', open = false }: Props = $props();

	let searchQuery = $state('');
	let navEl: HTMLElement | undefined;

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

	$effect(() => {
		if (open && currentSlug && navEl) {
			tick().then(() => {
				const activeEl = navEl?.querySelector('[data-active="true"]');
				activeEl?.scrollIntoView({ block: 'center', behavior: 'smooth' });
			});
		}
	});
</script>

<!-- Mobile overlay -->
{#if open}
	<button
		class="fixed inset-0 bg-black/40 z-40 md:hidden cursor-default"
		onclick={() => tocOpen.set(false)}
		aria-label="Close table of contents"
		tabindex="-1"
	></button>
{/if}

<aside
	class="w-72 shrink-0 border-r border-base-300/50 h-screen sticky top-0 overflow-y-auto flex flex-col bg-base-100/95 glass-navbar z-50
		fixed md:relative md:z-auto transition-transform duration-300"
	class:hidden={!open}
	class:-translate-x-full={!open}
	class:translate-x-0={open}
>
	<div class="p-4 border-b border-base-300/50 sticky top-0 bg-base-100/95 glass-navbar z-10">
		<div class="flex items-center justify-between mb-3">
			<h2 class="font-bold text-lg flex items-center gap-2">
				<Icon icon="mdi:table-of-contents" width="20" />
				Contents
			</h2>
			<button
				class="btn btn-ghost btn-xs btn-square md:hidden"
				onclick={() => tocOpen.set(false)}
				aria-label="Close"
			>
				<Icon icon="mdi:close" width="16" />
			</button>
		</div>
		<div class="relative">
			<Icon icon="mdi:magnify" width="16" class="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
			<input
				type="search"
				placeholder="Search chapters…"
				bind:value={searchQuery}
				class="input input-bordered input-sm w-full pl-9"
			/>
		</div>
	</div>

	<nav class="p-2 flex-1" bind:this={navEl}>
		{#each [...grouped] as [arc, arcChapters]}
			<details open class="mb-1">
				<summary class="cursor-pointer px-2 py-1.5 rounded-lg font-semibold text-sm opacity-70 hover:opacity-100 hover:bg-base-200/50 select-none transition-all flex items-center gap-2">
					<Icon icon="mdi:folder-outline" width="14" class="shrink-0" />
					<span class="flex-1 truncate">{arc}</span>
					<span class="text-xs opacity-50">{arcChapters.length}</span>
				</summary>
				<ul class="ml-2 mt-1 space-y-0.5">
					{#each arcChapters as chapter}
						{@const progress = $settings.readingProgress[chapter.slug] ?? 0}
						{@const isActive = chapter.slug === currentSlug}
						<li>
							<a
								href="{base}/chapter/{chapter.slug}"
								class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all duration-200"
								class:bg-primary={isActive}
								class:text-primary-content={isActive}
								class:shadow-sm={isActive}
								class:hover:bg-base-200={!isActive}
								data-active={isActive}
								onclick={() => tocOpen.set(false)}
							>
								<span class="truncate flex-1">{chapter.title}</span>
								{#if progress > 0}
									<span
										class="shrink-0 text-xs"
										class:opacity-70={isActive}
										class:opacity-40={!isActive}
										title="{progress}% read"
									>
										{#if progress >= 95}
											<Icon icon="mdi:check-circle" width="14" />
										{:else}
											{progress}%
										{/if}
									</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</details>
		{/each}

		{#if filtered.length === 0}
			<div class="text-center py-8">
				<Icon icon="mdi:file-search-outline" width="32" class="mx-auto mb-2 opacity-40" />
				<p class="opacity-50 text-sm">No chapters found.</p>
			</div>
		{/if}
	</nav>
</aside>
