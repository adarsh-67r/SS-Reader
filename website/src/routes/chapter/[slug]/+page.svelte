<script lang="ts">
	import type { PageData } from './$types';
	import Reader from '$lib/components/Reader.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import Giscus from '@giscus/svelte';
	import { settings, FONT_OPTIONS, type TextAlign } from '$lib/stores/settings';
	import { tocOpen } from '$lib/stores/ui';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Icon from '@iconify/svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let settingsModal: HTMLDialogElement | undefined;
	let isFullscreen = $state(false);

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
			isFullscreen = true;
		} else {
			document.exitFullscreen();
			isFullscreen = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

		switch (e.key) {
			case 'ArrowRight':
			case 'n':
			case 'N':
				if (data.next) goto(`${base}/chapter/${data.next.slug}`);
				break;
			case 'ArrowLeft':
			case 'p':
			case 'P':
				if (data.prev) goto(`${base}/chapter/${data.prev.slug}`);
				break;
			case 'h':
			case 'H':
				goto(`${base}/`);
				break;
			case 't':
			case 'T':
				tocOpen.update((v) => !v);
				break;
			case 's':
			case 'S':
				settingsModal?.showModal();
				break;
			case 'f':
			case 'F':
				toggleFullscreen();
				break;
			case 'c':
			case 'C':
				document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
				break;
		}
	}

	const alignOptions: { value: TextAlign; icon: string }[] = [
		{ value: 'left', icon: 'mdi:format-align-left' },
		{ value: 'center', icon: 'mdi:format-align-center' },
		{ value: 'right', icon: 'mdi:format-align-right' },
		{ value: 'justify', icon: 'mdi:format-align-justify' }
	];
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{data.chapter.title} — Shadow Slave</title>
	<meta name="description" content="Read {data.chapter.title} from Shadow Slave web novel." />
</svelte:head>

<div class="flex flex-1 h-full">
	<!-- TOC Sidebar -->
	{#if $tocOpen}
		<TableOfContents
			chapters={data.allChapters}
			currentSlug={data.chapter.slug}
			open={true}
		/>
	{/if}

	<div class="flex-1 overflow-y-auto">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
			<!-- Chapter header -->
			<header class="mb-8 text-center">
				<h1 class="text-3xl md:text-4xl font-bold leading-tight tracking-tight">{data.chapter.title}</h1>
				{#if data.chapter.arc}
					<p class="mt-2 text-sm opacity-50">{data.chapter.arc}</p>
				{/if}
			</header>

			<!-- Top navigation -->
			<Navigation prev={data.prev} next={data.next} current={data.chapter} />

			<div class="divider opacity-30"></div>

			<!-- Chapter content -->
			<Reader content={data.content} slug={data.chapter.slug} />

			<div class="divider mt-12 opacity-30"></div>

			<!-- Bottom navigation -->
			<Navigation prev={data.prev} next={data.next} current={data.chapter} />

			<!-- Floating action buttons -->
			<div class="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
				<button
					class="btn btn-circle btn-sm bg-base-200/80 glass-navbar shadow-lg border-base-300/50"
					onclick={() => settingsModal?.showModal()}
					aria-label="Settings"
					title="Settings (S)"
				>
					<Icon icon="mdi:cog" width="18" />
				</button>
				<button
					class="btn btn-circle btn-sm bg-base-200/80 glass-navbar shadow-lg border-base-300/50"
					onclick={toggleFullscreen}
					aria-label="Fullscreen"
					title="Fullscreen (F)"
				>
					<Icon icon={isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'} width="18" />
				</button>
			</div>

			<!-- Settings Modal -->
			<dialog bind:this={settingsModal} class="modal modal-bottom sm:modal-middle">
				<div class="modal-box max-w-lg">
					<div class="flex items-center justify-between mb-6">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<Icon icon="mdi:cog" width="20" />
							Reading Settings
						</h3>
						<form method="dialog">
							<button class="btn btn-ghost btn-sm btn-square">
								<Icon icon="mdi:close" width="18" />
							</button>
						</form>
					</div>

					<div class="space-y-6">
						<!-- Font Family -->
						<div>
							<div class="text-sm font-semibold opacity-70 mb-2 block">Font Family</div>
							<select
								value={$settings.fontFamily}
								onchange={(e) => settings.setFontFamily((e.target as HTMLSelectElement).value)}
								class="select select-bordered select-sm w-full"
							>
								{#each FONT_OPTIONS as font}
									<option value={font.value} style:font-family={font.value}>{font.label}</option>
								{/each}
							</select>
						</div>

						<!-- Font Size -->
						<div>
							<div class="text-sm font-semibold opacity-70 mb-2 flex justify-between">
								<span>Font Size</span>
								<span class="font-mono">{$settings.fontSize}px</span>
							</div>
							<input
								type="range"
								min="12"
								max="32"
								step="1"
								aria-label="Font size"
								value={$settings.fontSize}
								oninput={(e) => settings.setFontSize(Number((e.target as HTMLInputElement).value))}
								class="range range-sm range-primary w-full"
							/>
							<div class="flex justify-between text-xs opacity-40 mt-1">
								<span>12px</span>
								<span>32px</span>
							</div>
						</div>

						<!-- Line Height -->
						<div>
							<div class="text-sm font-semibold opacity-70 mb-2 flex justify-between">
								<span>Line Height</span>
								<span class="font-mono">{$settings.lineHeight}</span>
							</div>
							<input
								type="range"
								min="1.2"
								max="2.5"
								step="0.1"
								aria-label="Line height"
								value={$settings.lineHeight}
								oninput={(e) => settings.setLineHeight(Number((e.target as HTMLInputElement).value))}
								class="range range-sm range-primary w-full"
							/>
							<div class="flex justify-between text-xs opacity-40 mt-1">
								<span>1.2</span>
								<span>2.5</span>
							</div>
						</div>

						<!-- Font Weight -->
						<div>
							<div class="text-sm font-semibold opacity-70 mb-2 flex justify-between">
								<span>Font Weight</span>
								<span class="font-mono">{$settings.fontWeight}</span>
							</div>
							<input
								type="range"
								min="300"
								max="900"
								step="100"
								aria-label="Font weight"
								value={$settings.fontWeight}
								oninput={(e) => settings.setFontWeight(Number((e.target as HTMLInputElement).value))}
								class="range range-sm range-primary w-full"
							/>
							<div class="flex justify-between text-xs opacity-40 mt-1">
								<span>Light</span>
								<span>Bold</span>
							</div>
						</div>

						<!-- Text Alignment -->
						<div>
							<div class="text-sm font-semibold opacity-70 mb-2 block">Text Alignment</div>
							<div class="join w-full">
								{#each alignOptions as opt}
									<button
										class="btn btn-sm join-item flex-1"
										class:btn-primary={$settings.textAlign === opt.value}
										onclick={() => settings.setTextAlign(opt.value)}
									>
										<Icon icon={opt.icon} width="18" />
									</button>
								{/each}
							</div>
						</div>

						<!-- Toggles -->
						<div class="grid grid-cols-2 gap-3">
							<label class="label cursor-pointer gap-2 bg-base-200/50 rounded-lg p-3">
								<span class="label-text text-sm">Indent</span>
								<input
									type="checkbox"
									class="toggle toggle-sm toggle-primary"
									checked={$settings.indent}
									onchange={(e) => settings.setIndent((e.target as HTMLInputElement).checked)}
								/>
							</label>
							<label class="label cursor-pointer gap-2 bg-base-200/50 rounded-lg p-3">
								<span class="label-text text-sm">Hyphenation</span>
								<input
									type="checkbox"
									class="toggle toggle-sm toggle-primary"
									checked={$settings.hyphenation}
									onchange={(e) => settings.setHyphenation((e.target as HTMLInputElement).checked)}
								/>
							</label>
							<label class="label cursor-pointer gap-2 bg-base-200/50 rounded-lg p-3">
								<span class="label-text text-sm">Sticky Nav</span>
								<input
									type="checkbox"
									class="toggle toggle-sm toggle-primary"
									checked={$settings.stickyNavbar}
									onchange={(e) => settings.setStickyNavbar((e.target as HTMLInputElement).checked)}
								/>
							</label>
							<label class="label cursor-pointer gap-2 bg-base-200/50 rounded-lg p-3">
								<span class="label-text text-sm">Comments</span>
								<input
									type="checkbox"
									class="toggle toggle-sm toggle-primary"
									checked={$settings.showComments}
									onchange={(e) => settings.setShowComments((e.target as HTMLInputElement).checked)}
								/>
							</label>
						</div>

						<!-- Keyboard shortcuts info -->
						<details class="collapse collapse-arrow bg-base-200/50 rounded-lg">
							<summary class="collapse-title text-sm font-semibold min-h-0 py-3">
								<span class="flex items-center gap-2">
									<Icon icon="mdi:keyboard" width="16" />
									Keyboard Shortcuts
								</span>
							</summary>
							<div class="collapse-content">
								<div class="grid grid-cols-2 gap-1 text-xs">
									<span><kbd class="kbd kbd-xs">←</kbd> / <kbd class="kbd kbd-xs">P</kbd></span><span class="opacity-60">Previous chapter</span>
									<span><kbd class="kbd kbd-xs">→</kbd> / <kbd class="kbd kbd-xs">N</kbd></span><span class="opacity-60">Next chapter</span>
									<span><kbd class="kbd kbd-xs">H</kbd></span><span class="opacity-60">Home</span>
									<span><kbd class="kbd kbd-xs">T</kbd></span><span class="opacity-60">Table of Contents</span>
									<span><kbd class="kbd kbd-xs">S</kbd></span><span class="opacity-60">Settings</span>
									<span><kbd class="kbd kbd-xs">F</kbd></span><span class="opacity-60">Fullscreen</span>
									<span><kbd class="kbd kbd-xs">C</kbd></span><span class="opacity-60">Comments</span>
								</div>
							</div>
						</details>

						<!-- Reset button -->
						<button
							class="btn btn-ghost btn-sm w-full"
							onclick={() => settings.reset()}
						>
							<Icon icon="mdi:restore" width="16" />
							Reset to Defaults
						</button>
					</div>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>

			<!-- Comments section -->
			{#if $settings.showComments}
				<section class="mt-16" id="comments">
					<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
						<Icon icon="mdi:comment-text-outline" width="22" />
						Comments
					</h2>
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
			{/if}
		</div>
	</div>
</div>
