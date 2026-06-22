import type { DiscoveredApp, TraefikRouter } from '$lib/types';
import { discoverApps } from '$lib/discover';
import { resolveTraefikBase } from './traefik-config';

async function fetchRouters(base: string): Promise<TraefikRouter[]> {
	const res = await fetch(`${base}/api/http/routers`, {
		signal: AbortSignal.timeout(5000)
	});
	if (!res.ok) {
		throw new Error(`Traefik API returned ${res.status} for /api/http/routers`);
	}
	return res.json();
}

// Resolve Traefik, fetch routers, return discovered apps.
export async function getApps(): Promise<DiscoveredApp[]> {
	const base = await resolveTraefikBase();
	const routers = await fetchRouters(base);
	return discoverApps(routers);
}
