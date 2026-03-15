<script lang="ts">
	import { base } from '$app/paths';
	import { chaptersStore, chapterList } from '$lib/stores/chapters';
	import { settings } from '$lib/stores/settings';
	import Icon from '@iconify/svelte';

	const chapters = chapterList;
	const meta = chaptersStore;

	let searchQuery = $state('');

	const filtered = $derived(
		searchQuery.trim()
			? $chapters.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
			: $chapters
	);

	// Group by arc
	const grouped = $derived.by(() => {
		const map = new Map<string, typeof $chapters>();
		for (const ch of filtered) {
			const arc = ch.arc ?? 'Uncategorized';
			if (!map.has(arc)) map.set(arc, []);
			map.get(arc)!.push(ch);
		}
		return map;
	});
</script>

<svelte:head>
	<title>Shadow Slave Reader</title>
	<meta name="description" content="Read Shadow Slave web novel online with a clean, distraction-free reader." />
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-12">
	<!-- Hero -->
	<section class="text-center mb-16">
		<div class="mb-6">
			<Icon icon="mdi:book-open-page-variant" width="64" class="mx-auto opacity-60 mb-4" />
		</div>
		<h1 class="text-5xl md:text-6xl font-bold mb-4 tracking-tight drop-shadow-lg">
			Shadow Slave
		</h1>
		{#if $meta}
			<p class="text-lg opacity-70 mb-2 max-w-2xl mx-auto">{$meta.description}</p>
			<p class="text-sm opacity-50 mt-2">
				By <span class="font-semibold">{$meta.author}</span> · {$meta.totalChapters} chapters
			</p>
		{:else}
			<div class="flex justify-center py-4">
				<span class="loading loading-dots loading-md opacity-50"></span>
			</div>
		{/if}

		<div class="mt-10 flex flex-wrap justify-center gap-4">
			{#if $settings.lastReadChapter}
				<a
					href="{base}/chapter/{$settings.lastReadChapter}"
					class="btn btn-primary btn-lg shadow-lg gap-2"
				>
					<Icon icon="mdi:book-open-variant" width="20" />
					Continue Reading
				</a>
				{#if $chapters.length > 0}
					<a
						href="{base}/chapter/{$chapters[0].slug}"
						class="btn btn-outline btn-lg gap-2"
					>
						<Icon icon="mdi:restart" width="20" />
						Start Over
					</a>
				{/if}
			{:else if $chapters.length > 0}
				<a
					href="{base}/chapter/{$chapters[0].slug}"
					class="btn btn-primary btn-lg shadow-lg gap-2"
				>
					<Icon icon="mdi:book-open-variant" width="20" />
					Start Reading
				</a>
			{/if}
		</div>
	</section>

	<!-- Chapter list -->
	{#if $chapters.length > 0}
		<section>
			<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
				<h2 class="text-2xl font-semibold flex items-center gap-2">
					<Icon icon="mdi:format-list-bulleted" width="24" />
					Chapters
				</h2>
				<div class="relative w-full sm:w-72">
					<Icon icon="mdi:magnify" width="18" class="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
					<input
						type="search"
						placeholder="Search chapters…"
						bind:value={searchQuery}
						class="input input-bordered input-sm w-full pl-9"
					/>
				</div>
			</div>

			{#each [...grouped] as [arc, arcChapters]}
				<details open class="mb-4">
					<summary class="cursor-pointer px-3 py-2 rounded-lg font-semibold text-sm bg-base-200/50 hover:bg-base-200 transition-colors select-none flex items-center gap-2">
						<Icon icon="mdi:folder-outline" width="16" />
						{arc}
						<span class="badge badge-sm badge-ghost ml-auto">{arcChapters.length}</span>
					</summary>
					<div class="grid gap-1 mt-2 pl-2">
						{#each arcChapters as chapter}
							{@const progress = $settings.readingProgress[chapter.slug] ?? 0}
							<a
								href="{base}/chapter/{chapter.slug}"
								class="flex items-center gap-4 p-3 rounded-lg hover:bg-base-200 transition-all duration-200 group border border-transparent hover:border-base-300"
							>
								<span class="text-sm opacity-40 w-12 shrink-0 text-right font-mono">#{chapter.number}</span>
								<span class="flex-1 truncate group-hover:text-primary transition-colors font-medium">{chapter.title}</span>
								{#if progress > 0}
									<div class="w-16 shrink-0 flex items-center gap-2">
										{#if progress >= 95}
											<Icon icon="mdi:check-circle" width="16" class="text-success shrink-0" />
										{:else}
											<div class="w-full bg-base-300 rounded-full h-1.5">
												<div class="bg-primary h-1.5 rounded-full transition-all duration-300" style:width="{progress}%"></div>
											</div>
										{/if}
									</div>
								{/if}
							</a>
						{/each}
					</div>
				</details>
			{/each}

			{#if filtered.length === 0}
				<div class="text-center py-12 opacity-50">
					<Icon icon="mdi:file-search-outline" width="48" class="mx-auto mb-4" />
					<p class="text-lg">No chapters found matching "{searchQuery}"</p>
				</div>
			{/if}
		</section>
	{:else if !$meta}
		<div class="text-center py-16 opacity-50">
			<Icon icon="mdi:book-off-outline" width="48" class="mx-auto mb-4" />
			<p class="text-xl mb-4">No chapters found.</p>
			<p class="text-sm">Run <code class="font-mono bg-base-200 px-2 py-1 rounded">node scripts/process-epub.js</code> to extract chapters from the EPUB.</p>
		</div>
	{/if}
</div>
