<script lang="ts">
	import type { DiscoveredApp } from '$lib/types';

	let { app }: { app: DiscoveredApp } = $props();

	let faviconError = $state(false);
	const letter = $derived((app.name[0] ?? '?').toUpperCase());
</script>

<a
	href={app.url}
	target="_blank"
	rel="external noreferrer"
	class="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-400 hover:shadow-sm"
>
	<div class="flex items-center justify-between gap-2">
		<div class="flex min-w-0 items-center gap-2">
			{#if faviconError}
				<span
					class="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-400"
				>
					{letter}
				</span>
			{:else}
				<img
					src={`${app.url}/favicon.ico`}
					alt=""
					class="h-5 w-5 shrink-0 rounded"
					onerror={() => (faviconError = true)}
				/>
			{/if}
			<span class="truncate font-semibold capitalize">{app.name}</span>
		</div>
		{#if app.authGated}
			<i
				class="hn hn-lock shrink-0 text-amber-600"
				title="Requires authentication"
				aria-label="Requires authentication"
			></i>
		{/if}
	</div>
	<span class="mt-1 block truncate text-sm text-gray-500">{app.host}</span>
</a>
