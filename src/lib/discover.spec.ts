import { describe, it, expect } from 'vitest';
import { discoverApps } from './discover';
import type { TraefikRouter } from './types';

// Shaped like real GET /api/http/routers output.
const fixture: TraefikRouter[] = [
	{
		entryPoints: ['web'],
		service: 'acme-http@internal',
		rule: 'PathPrefix(`/.well-known/acme-challenge/`)',
		status: 'enabled',
		name: 'acme-http@internal',
		provider: 'internal'
	},
	{
		entryPoints: ['websecure'],
		middlewares: ['tinyauth@docker'],
		service: 'actual',
		rule: 'Host(`actual.example.com`)',
		status: 'enabled',
		name: 'actual@docker',
		provider: 'docker'
	},
	{
		entryPoints: ['websecure'],
		service: 'webapp',
		rule: 'Host(`webapp.example.com`) || Host(`www.webapp.example.com`)',
		status: 'enabled',
		name: 'webapp@docker',
		provider: 'docker'
	},
	{
		entryPoints: ['web'],
		service: 'plain',
		rule: 'Host(`plain.example.com`)',
		status: 'enabled',
		name: 'plain@docker',
		provider: 'docker'
	},
	{
		entryPoints: ['websecure'],
		service: 'down',
		rule: 'Host(`down.example.com`)',
		status: 'disabled',
		name: 'down@docker',
		provider: 'docker'
	}
];

describe('discoverApps', () => {
	const apps = discoverApps(fixture);

	it('drops internal and disabled routers', () => {
		expect(apps.find((a) => a.host === 'down.example.com')).toBeUndefined();
		expect(apps.some((a) => a.provider === 'internal')).toBe(false);
	});

	it('keeps the public routers, sorted by name', () => {
		expect(apps.map((a) => a.name)).toEqual(['actual', 'plain', 'webapp']);
	});

	it('takes the first host from a multi-host rule', () => {
		const webapp = apps.find((a) => a.name === 'webapp');
		expect(webapp?.host).toBe('webapp.example.com');
	});

	it('picks scheme from entrypoint', () => {
		expect(apps.find((a) => a.name === 'actual')?.url).toBe('https://actual.example.com');
		expect(apps.find((a) => a.name === 'plain')?.url).toBe('http://plain.example.com');
	});

	it('flags tinyauth middleware as auth-gated', () => {
		expect(apps.find((a) => a.name === 'actual')?.authGated).toBe(true);
		expect(apps.find((a) => a.name === 'plain')?.authGated).toBe(false);
	});
});
