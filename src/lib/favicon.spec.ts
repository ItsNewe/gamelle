import { describe, it, expect } from 'vitest';
import { parseIconHref } from './favicon';

const BASE = 'https://app.example.com';

describe('parseIconHref', () => {
	it('returns null when no icon link is present', () => {
		expect(parseIconHref('<head><link rel="stylesheet" href="/x.css"></head>', BASE)).toBeNull();
	});

	it('resolves a relative icon href against the base', () => {
		const html = '<head><link rel="icon" href="/static/favicon.png"></head>';
		expect(parseIconHref(html, BASE)).toBe('https://app.example.com/static/favicon.png');
	});

	it('keeps absolute icon hrefs as-is', () => {
		const html = '<head><link rel="icon" href="https://cdn.example.com/i.ico"></head>';
		expect(parseIconHref(html, BASE)).toBe('https://cdn.example.com/i.ico');
	});

	it('handles "shortcut icon" and single quotes', () => {
		const html = "<head><link rel='shortcut icon' href='/fav.ico'></head>";
		expect(parseIconHref(html, BASE)).toBe('https://app.example.com/fav.ico');
	});

	it('prefers a standard icon over apple-touch-icon', () => {
		const html =
			'<head><link rel="apple-touch-icon" href="/apple.png"><link rel="icon" href="/icon.png"></head>';
		expect(parseIconHref(html, BASE)).toBe('https://app.example.com/icon.png');
	});

	it('falls back to apple-touch-icon when no standard icon exists', () => {
		const html = '<head><link rel="apple-touch-icon" href="/apple.png"></head>';
		expect(parseIconHref(html, BASE)).toBe('https://app.example.com/apple.png');
	});

	it('ignores links in the body', () => {
		const html = '<head></head><body><link rel="icon" href="/nope.png"></body>';
		expect(parseIconHref(html, BASE)).toBeNull();
	});
});
