// localStorage-backed set of hidden app ids (host)
// Default state is visible
import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';

const STORAGE_KEY = 'gamelle:hidden-apps';

function load(): string[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
	} catch {
		return [];
	}
}

const hidden = new SvelteSet<string>(load());

function persist(): void {
	if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify([...hidden]));
}

export function isHidden(id: string): boolean {
	return hidden.has(id);
}

export function setHidden(id: string, value: boolean): void {
	if (value) hidden.add(id);
	else hidden.delete(id);
	persist();
}

export function hiddenCount(): number {
	return hidden.size;
}
