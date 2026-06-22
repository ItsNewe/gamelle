// Parse an icon URL out of a page's <link rel="...icon..."> tags

function attr(tag: string, name: string): string | null {
	const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
	return m ? (m[2] ?? m[3] ?? m[4] ?? null) : null;
}

// Lower score = higher priority: standard icon, then apple-touch, then the rest (e.g. mask-icon).
function score(rel: string): number {
	if (/(^|\s)icon$/.test(rel) || rel.includes('shortcut icon')) return 0;
	if (rel.includes('apple-touch-icon')) return 1;
	return 2;
}

// Return the best icon href or null if none
export function parseIconHref(html: string, base: string): string | null {
	const head = html.split(/<\/head>/i)[0] ?? html;
	const tags = head.match(/<link\b[^>]*>/gi) ?? [];

	const candidates: { rel: string; href: string }[] = [];
	for (const tag of tags) {
		const rel = attr(tag, 'rel');
		const href = attr(tag, 'href');
		if (!rel || !href) continue;
		const tokens = rel.toLowerCase().split(/\s+/);
		if (tokens.some((t) => t === 'icon' || t.endsWith('-icon'))) {
			candidates.push({ rel: rel.toLowerCase(), href });
		}
	}
	if (candidates.length === 0) return null;

	candidates.sort((a, b) => score(a.rel) - score(b.rel));
	try {
		return new URL(candidates[0].href, base).toString();
	} catch {
		return null;
	}
}
