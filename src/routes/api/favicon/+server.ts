import type { RequestHandler } from './$types';
import { getApps } from '$lib/server/traefik';
import { parseIconHref } from '$lib/favicon';

// Resolve an app's icon from its <link rel="icon"> tag
// Only hosts that Traefik discovered are fetched
export const GET: RequestHandler = async ({ url }) => {
	const host = url.searchParams.get('host');
	if (!host) return new Response(null, { status: 400 });

	const app = (await getApps()).find((a) => a.host === host);
	if (!app) return new Response(null, { status: 404 });

	try {
		const res = await fetch(app.url, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) return new Response(null, { status: 502 });

		const href = parseIconHref(await res.text(), res.url || app.url);
		if (!href) return new Response(null, { status: 404 });

		return new Response(JSON.stringify({ href }), {
			headers: { 'content-type': 'application/json' }
		});
	} catch {
		return new Response(null, { status: 502 });
	}
};
