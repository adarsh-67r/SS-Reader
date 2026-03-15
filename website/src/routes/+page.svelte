<script lang="ts">
	import { base } from '$app/paths';
	import { chaptersStore, chapterList } from '$lib/stores/chapters';
	import { settings } from '$lib/stores/settings';
	import TableOfContents from '$lib/components/TableOfContents.svelte';

	const chapters = chapterList;
	const meta = chaptersStore;
</script>

<svelte:head>
	<title>Shadow Slave Reader</title>
	<meta name="description" content="Read Shadow Slave web novel online with a clean, distraction-free reader." />
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-12">
	<!-- Hero -->
	<section class="text-center mb-16">
		<h1 class="text-5xl font-bold mb-4 tracking-tight">Shadow Slave</h1>
		{#if $meta}
			<p class="text-lg opacity-70 mb-2">{$meta.description}</p>
			<p class="text-sm opacity-50">By {$meta.author} · {$meta.totalChapters} chapters</p>
		{:else}
			<p class="opacity-50">Loading…</p>
		{/if}

		{#if $settings.lastReadChapter}
			<div class="mt-8">
				<a
					href="{base}/chapter/{$settings.lastReadChapter}"
					class="btn btn-primary btn-lg"
				>
					Continue Reading
				</a>
			</div>
		{:else if $chapters.length > 0}
			<div class="mt-8">
				<a
					href="{base}/chapter/{$chapters[0].slug}"
					class="btn btn-primary btn-lg"
				>
					Start Reading
				</a>
			</div>
		{/if}
	</section>

	<!-- Chapter list -->
	{#if $chapters.length > 0}
		<section>
			<h2 class="text-2xl font-semibold mb-6">Chapters</h2>
			<div class="grid gap-2">
				{#each $chapters as chapter}
					{@const progress = $settings.readingProgress[chapter.slug] ?? 0}
					<a
						href="{base}/chapter/{chapter.slug}"
						class="flex items-center gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors group"
					>
						<span class="text-sm opacity-50 w-12 shrink-0 text-right">#{chapter.number}</span>
						<span class="flex-1 truncate group-hover:text-primary transition-colors">{chapter.title}</span>
						{#if chapter.arc}
							<span class="badge badge-ghost badge-sm hidden sm:inline-flex">{chapter.arc}</span>
						{/if}
						{#if progress > 0}
							<div class="w-16 shrink-0">
								<div class="w-full bg-base-300 rounded-full h-1">
									<div class="bg-primary h-1 rounded-full" style:width="{progress}%"></div>
								</div>
							</div>
						{/if}
					</a>
				{/each}
			</div>
		</section>
	{:else if !$meta}
		<div class="text-center py-16 opacity-50">
			<p class="text-xl mb-4">No chapters found.</p>
			<p class="text-sm">Run <code class="font-mono bg-base-200 px-1 rounded">node scripts/process-epub.js</code> to extract chapters from the EPUB.</p>
		</div>
	{/if}
</div>
