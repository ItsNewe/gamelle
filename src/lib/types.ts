// Shared Traefik + app types

// Subset of a Traefik HTTP router
export interface TraefikRouter {
	entryPoints?: string[];
	service?: string;
	rule?: string;
	middlewares?: string[];
	status?: string;
	name?: string;
	provider?: string;
}

// App discovered from Traefik routers
export interface DiscoveredApp {
	name: string;
	url: string;
	host: string;
	authGated: boolean;
	provider: string;
}
