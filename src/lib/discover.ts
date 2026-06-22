import type { DiscoveredApp, TraefikRouter } from './types';

// Pull the first Host(`...`) value out of a router rule.
function parseHost(rule: string | undefined): string | null {
	const match = rule?.match(/Host\(`([^`]+)`\)/);
	return match ? match[1] : null;
}

function scheme(entryPoints: string[] | undefined): string {
	return entryPoints?.includes('websecure') ? 'https' : 'http';
}

function isAuthGated(middlewares: string[] | undefined): boolean {
	return (middlewares ?? []).some((m) => /tinyauth/i.test(m));
}

// Strip the @provider suffix from a router name
function cleanName(name: string | undefined, host: string): string {
	return name?.split('@')[0] || host;
}

// Turn Traefik routers into a list of linkable apps
export function discoverApps(routers: TraefikRouter[]): DiscoveredApp[] {
	const byHost = new Map<string, DiscoveredApp>();

	for (const router of routers) {
		if (router.provider === 'internal') continue;
		if (router.status !== 'enabled') continue;

		const host = parseHost(router.rule);
		if (!host || byHost.has(host)) continue;

		byHost.set(host, {
			name: cleanName(router.name, host),
			url: `${scheme(router.entryPoints)}://${host}`,
			host,
			authGated: isAuthGated(router.middlewares),
			provider: router.provider ?? 'unknown'
		});
	}

	return [...byHost.values()].sort((a, b) => a.name.localeCompare(b.name));
}
