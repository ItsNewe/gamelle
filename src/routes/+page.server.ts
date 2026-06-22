import type { PageServerLoad } from './$types';
import { getApps } from '$lib/server/traefik';

export const load: PageServerLoad = async () => {
	try {
		return { apps: await getApps() };
	} catch (err) {
		return { apps: [], error: err instanceof Error ? err.message : 'Unknown error' };
	}
};
