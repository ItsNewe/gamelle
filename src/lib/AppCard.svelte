<script lang="ts">
	import type { DiscoveredApp } from '$lib/types';
	import { getCachedFavicon, setCachedFavicon } from '$lib/favicon-cache';

	let { app }: { app: DiscoveredApp } = $props();

	// Read the cache once. Cards are keyed by host, so app is stable for this component's
	// lifetime; the closure keeps svelte-check from flagging a one-time reactive read.
	// undefined = unknown, string = resolved URL, null = known to have no favicon.
	const cached = (() => getCachedFavicon(app.host))();

	let override = $state<string | null>(typeof cached === 'string' ? cached : null);
	let triedLink = $state(false);
	let faviconError = $state(cached === null);
	const src = $derived(override ?? `${app.url}/favicon.ico`);
	const letter = $derived((app.name[0] ?? '?').toUpperCase());

	// Cache whichever URL actually rendered so later loads skip the probe.
	function handleLoad() {
		setCachedFavicon(app.host, src);
	}

	// On load failure: try the app's <link rel="icon"> once, then fall back to a letter.
	async function handleError() {
		if (triedLink) {
			faviconError = true;
			setCachedFavicon(app.host, null);
			return;
		}
		triedLink = true;
		try {
			const res = await fetch(`/api/favicon?host=${encodeURIComponent(app.host)}`);
			if (res.ok) {
				const { href } = await res.json();
				if (href) {
					override = href;
					return;
				}
			}
		} catch {
			// ignore and fall through to the letter avatar
		}
		faviconError = true;
		setCachedFavicon(app.host, null);
	}
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
					{src}
					alt=""
					class="h-5 w-5 shrink-0 rounded"
					onload={handleLoad}
					onerror={handleError}
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
