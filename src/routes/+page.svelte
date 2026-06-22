<script lang="ts">
	import type { PageData } from './$types';
	import AppCard from '$lib/AppCard.svelte';
	import { isHidden, setHidden } from '$lib/visibility.svelte';
	import favicon from '$lib/assets/gamelle-icon.png';

	let { data }: { data: PageData } = $props();

	let showSettings = $state(false);

	const visibleApps = $derived(data.apps.filter((app) => !isHidden(app.host)));
	const hiddenCount = $derived(data.apps.filter((app) => isHidden(app.host)).length);
</script>

<svelte:head><title>Gamelle</title></svelte:head>

<main class="mx-auto max-w-5xl px-6 py-12">
	<header class="mb-10 flex items-start justify-between gap-4">
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-bold tracking-tight">
				<img src={favicon} alt="" class="h-[1em] w-auto" />
				Gamelle
			</h1>
			<p class="mt-1 text-sm text-gray-500">Apps discovered via Traefik</p>
		</div>
		{#if data.apps?.length}
			<button
				type="button"
				onclick={() => (showSettings = !showSettings)}
				aria-pressed={showSettings}
				title="Show or hide apps"
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-lg leading-none text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
			>
				<i class="hn hn-cog" aria-label="Settings"></i>
			</button>
		{/if}
	</header>

	{#if showSettings && data.apps?.length}
		<section class="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-sm font-semibold text-gray-700">Visible apps</h2>
				<span class="text-xs text-gray-500">{hiddenCount} hidden</span>
			</div>
			<ul class="grid grid-cols-1 gap-1 sm:grid-cols-2">
				{#each data.apps as app (app.host)}
					<li>
						<label class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-white">
							<input
								type="checkbox"
								class="rounded"
								checked={!isHidden(app.host)}
								onchange={(e) => setHidden(app.host, !e.currentTarget.checked)}
							/>
							<span class="truncate text-sm capitalize">{app.name}</span>
							<span class="ml-auto truncate text-xs text-gray-400">{app.host}</span>
						</label>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if data.error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			<p class="font-medium">Could not reach Traefik</p>
			<p class="mt-1">{data.error}</p>
		</div>
	{:else if data.apps.length === 0}
		<p class="text-gray-500">No apps discovered.</p>
	{:else if visibleApps.length === 0}
		<p class="text-gray-500">All apps are hidden. Open settings to show them.</p>
	{:else}
		<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each visibleApps as app (app.host)}
				<li>
					<AppCard {app} />
				</li>
			{/each}
		</ul>
	{/if}
</main>
