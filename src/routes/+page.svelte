<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Gamelle</title></svelte:head>

<main class="mx-auto max-w-5xl px-6 py-12">
	<header class="mb-10">
		<h1 class="text-3xl font-bold tracking-tight">Gamelle</h1>
		<p class="mt-1 text-sm text-gray-500">Apps discovered via Traefik</p>
	</header>

	{#if data.error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			<p class="font-medium">Could not reach Traefik</p>
			<p class="mt-1">{data.error}</p>
		</div>
	{:else if data.apps.length === 0}
		<p class="text-gray-500">No apps discovered.</p>
	{:else}
		<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.apps as app (app.host)}
				<li>
					<a
						href={app.url}
						target="_blank"
						rel="external noreferrer"
						class="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-400 hover:shadow-sm"
					>
						<div class="flex items-center justify-between">
							<span class="font-semibold capitalize">{app.name}</span>
							{#if app.authGated}
								<span
									title="Requires authentication"
									class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
								>
									Locked
								</span>
							{/if}
						</div>
						<span class="mt-1 block truncate text-sm text-gray-500">{app.host}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>
