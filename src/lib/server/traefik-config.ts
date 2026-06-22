import { env } from '$env/dynamic/private';

// Default candidate base URLs probed when TRAEFIK_API_URL is unset.
const DEFAULT_CANDIDATES = [
	'http://localhost:8080',
	'http://traefik:8080',
	'http://127.0.0.1:8080'
];

const PROBE_TIMEOUT_MS = 2000;

let cachedBase: string | null = null;

// Trailing slashes break URL joins
function clean(base: string): string {
	return base.trim().replace(/\/+$/, '');
}

function candidates(): string[] {
	const extra = (env.TRAEFIK_DISCOVER_CANDIDATES ?? '').split(',').map(clean).filter(Boolean);
	return [...extra, ...DEFAULT_CANDIDATES];
}

async function probe(base: string): Promise<boolean> {
	try {
		const res = await fetch(`${base}/api/overview`, {
			signal: AbortSignal.timeout(PROBE_TIMEOUT_MS)
		});
		return res.ok;
	} catch {
		return false;
	}
}

// Resolve the Traefik API base URL from env, else autodiscover by probing
export async function resolveTraefikBase(): Promise<string> {
	if (env.TRAEFIK_API_URL) return clean(env.TRAEFIK_API_URL);
	if (cachedBase) return cachedBase;

	for (const base of candidates()) {
		if (await probe(base)) {
			cachedBase = base;
			return base;
		}
	}
	throw new Error(
		'Could not locate Traefik. Set TRAEFIK_API_URL in .env or expose a reachable Traefik API.'
	);
}
