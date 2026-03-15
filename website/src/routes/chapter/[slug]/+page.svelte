<script lang="ts">
	import type { PageData } from './$types';
	import Reader from '$lib/components/Reader.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import Giscus from '@giscus/svelte';
	import { settings } from '$lib/stores/settings';
	import { tocOpen } from '$lib/stores/ui';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{data.chapter.title} — Shadow Slave</title>
	<meta name="description" content="Read {data.chapter.title} from Shadow Slave web novel." />
</svelte:head>

<div class="flex flex-1 h-full">
	<!-- TOC Sidebar (desktop) -->
	{#if $tocOpen}
		<TableOfContents
			chapters={data.allChapters}
			currentSlug={data.chapter.slug}
			open={true}
		/>
	{/if}

	<div class="flex-1 overflow-y-auto">
		<div class="max-w-3xl mx-auto px-4 py-8">
			<!-- Chapter header -->
			<header class="mb-8 text-center">
				<button
					class="btn btn-ghost btn-xs mb-4"
					onclick={() => tocOpen.update((v) => !v)}
					aria-label="Toggle Table of Contents"
				>
					{$tocOpen ? '← Hide ToC' : '☰ Table of Contents'}
				</button>
				<h1 class="text-3xl font-bold leading-tight">{data.chapter.title}</h1>
				{#if data.chapter.arc}
					<p class="mt-2 text-sm opacity-60">{data.chapter.arc}</p>
				{/if}
			</header>

			<!-- Top navigation -->
			<Navigation prev={data.prev} next={data.next} current={data.chapter} />

			<div class="divider"></div>

			<!-- Chapter content -->
			<Reader content={data.content} slug={data.chapter.slug} />

			<div class="divider mt-12"></div>

			<!-- Bottom navigation -->
			<Navigation prev={data.prev} next={data.next} current={data.chapter} />

			<!-- Reading settings panel -->
			<details class="mt-8 collapse collapse-arrow bg-base-200 rounded-box">
				<summary class="collapse-title font-medium">Reading Settings</summary>
				<div class="collapse-content space-y-4">
					<div class="flex items-center gap-4 flex-wrap">
						<label class="flex items-center gap-2">
							<span class="text-sm">Font size:</span>
							<input
								type="range"
								min="14"
								max="24"
								step="1"
								value={$settings.fontSize}
								oninput={(e) => settings.setFontSize(Number((e.target as HTMLInputElement).value))}
								class="range range-xs range-primary w-32"
							/>
							<span class="text-sm w-8">{$settings.fontSize}px</span>
						</label>

						<label class="flex items-center gap-2">
							<span class="text-sm">Font:</span>
							<select
								value={$settings.fontFamily}
								onchange={(e) => settings.setFontFamily((e.target as HTMLSelectElement).value as 'serif' | 'sans')}
								class="select select-xs select-bordered"
							>
								<option value="serif">Serif</option>
								<option value="sans">Sans-serif</option>
							</select>
						</label>

						<label class="flex items-center gap-2">
							<span class="text-sm">Line height:</span>
							<input
								type="range"
								min="1.4"
								max="2.4"
								step="0.1"
								value={$settings.lineHeight}
								oninput={(e) => settings.setLineHeight(Number((e.target as HTMLInputElement).value))}
								class="range range-xs range-primary w-32"
							/>
							<span class="text-sm w-8">{$settings.lineHeight}</span>
						</label>
					</div>
				</div>
			</details>

			<!-- Comments section -->
			<section class="mt-16" id="comments">
				<h2 class="text-xl font-semibold mb-4">Comments</h2>
				<Giscus
					id="comments"
					repo="adarsh-67r/SS-Reader"
					repoId="R_kgDORn3p1A"
					category="Announcements"
					categoryId="DIC_kwDORn3p1A4CsGOj"
					mapping="pathname"
					term=""
					reactionsEnabled="1"
					emitMetadata="0"
					inputPosition="top"
					theme={$settings.theme}
					lang="en"
					loading="lazy"
				/>
			</section>
		</div>
	</div>
</div>
