// Per-host favicon URL cache, persisted in the browser to skip repeated probes
// Value: string = resolved icon URL, null = known to have none (use letter avatar)
import { browser } from '$app/environment';

const STORAGE_KEY = 'gamelle:favicons';

type Cache = Record<string, string | null>;

function read(): Cache {
	if (!browser) return {};
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		return {};
	}
}

// undefined = not cached, string = URL, null = no favicon.
export function getCachedFavicon(host: string): string | null | undefined {
	const cache = read();
	return host in cache ? cache[host] : undefined;
}

export function setCachedFavicon(host: string, url: string | null): void {
	if (!browser) return;
	const cache = read();
	if (cache[host] === url) return;
	cache[host] = url;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}
