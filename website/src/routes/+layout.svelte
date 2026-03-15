<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { settings, THEME_OPTIONS } from '$lib/stores/settings';
	import { chaptersStore } from '$lib/stores/chapters';
	import { tocOpen } from '$lib/stores/ui';
	import { registerIcons } from '$lib/icons';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	registerIcons();

	let { children } = $props();

	let themeDropdownOpen = $state(false);

	onMount(() => {
		document.documentElement.setAttribute('data-theme', $settings.theme);
		chaptersStore.load(base);
	});

	function setTheme(theme: string) {
		settings.setTheme(theme);
		themeDropdownOpen = false;
	}

	const isReaderPage = $derived($page.url.pathname.includes('/chapter/'));
</script>

<div class="min-h-screen flex flex-col bg-base-100 text-base-content">
	<!-- Top navbar -->
	<header
		class="navbar glass-navbar bg-base-200/80 shadow-md z-50 px-4 gap-2 border-b border-base-300/50"
		class:sticky={$settings.stickyNavbar}
		class:top-0={$settings.stickyNavbar}
	>
		<div class="flex-1 flex items-center gap-3">
			{#if isReaderPage}
				<button
					class="btn btn-ghost btn-sm btn-square"
					onclick={() => tocOpen.update((v) => !v)}
					aria-label="Toggle Table of Contents"
					title="Table of Contents (T)"
				>
					<Icon icon="mdi:table-of-contents" width="20" />
				</button>
			{/if}
			<a href="{base}/" class="btn btn-ghost text-lg font-bold tracking-tight gap-2 px-2">
				<Icon icon="mdi:book-open-page-variant" width="24" />
				<span class="hidden sm:inline">Shadow Slave</span>
			</a>
		</div>

		<div class="flex items-center gap-1">
			{#if isReaderPage}
				<a
					href="{base}/"
					class="btn btn-ghost btn-sm btn-square"
					aria-label="Home"
					title="Home (H)"
				>
					<Icon icon="mdi:home" width="20" />
				</a>
			{/if}

			<!-- Theme selector dropdown -->
			<div class="dropdown dropdown-end">
				<button
					class="btn btn-ghost btn-sm btn-square"
					aria-label="Change theme"
					title="Change theme"
					onclick={() => (themeDropdownOpen = !themeDropdownOpen)}
				>
					<Icon icon="mdi:palette" width="20" />
				</button>
				{#if themeDropdownOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="dropdown-content z-[100] mt-2 p-2 shadow-xl bg-base-200 rounded-box w-44 border border-base-300">
						<div class="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto">
							{#each THEME_OPTIONS as theme}
								<button
									class="btn btn-sm btn-ghost justify-start capitalize"
									class:btn-active={$settings.theme === theme}
									onclick={() => setTheme(theme)}
								>
									<span class="w-4 h-4 rounded-full" data-theme={theme} style="background: oklch(var(--p))"></span>
									{theme}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<!-- Main content -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer (only on non-reader pages) -->
	{#if !isReaderPage}
		<footer class="footer footer-center p-6 bg-base-200/50 text-base-content/60 text-sm border-t border-base-300/50">
			<p>Shadow Slave Reader · Built with SvelteKit</p>
		</footer>
	{/if}
</div>
