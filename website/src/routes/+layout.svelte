<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { settings } from '$lib/stores/settings';
	import { chaptersStore } from '$lib/stores/chapters';
	import { tocOpen } from '$lib/stores/ui';
	import { base } from '$app/paths';

	let { children } = $props();

	onMount(() => {
		// Apply saved theme on load
		document.documentElement.setAttribute('data-theme', $settings.theme);
		// Load chapter metadata
		chaptersStore.load(base);
	});

	function toggleTheme() {
		settings.setTheme($settings.theme === 'dark' ? 'light' : 'dark');
	}
</script>

<div class="min-h-screen flex flex-col bg-base-100 text-base-content">
	<!-- Top navbar -->
	<header class="navbar bg-base-200 shadow-sm sticky top-0 z-50 px-4 gap-2">
		<div class="flex-1 flex items-center gap-3">
			<button
				class="btn btn-ghost btn-sm"
				onclick={() => tocOpen.update((v) => !v)}
				aria-label="Toggle Table of Contents"
			>
				☰
			</button>
			<a href="{base}/" class="text-lg font-bold truncate">Shadow Slave</a>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="btn btn-ghost btn-sm"
				onclick={toggleTheme}
				aria-label="Toggle theme"
				title="Toggle light/dark mode"
			>
				{#if $settings.theme === 'dark'}🌙{:else}☀️{/if}
			</button>
		</div>
	</header>

	<!-- Main content -->
	<main class="flex-1">
		{@render children()}
	</main>
</div>
