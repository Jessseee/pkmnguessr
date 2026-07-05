import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
		experimental: { async: true }
	},
	kit: {
		adapter: adapter(),
		csp: {
			mode: "auto",
			directives: { "script-src": ["self"] },
		},
		csrf: {
			trustedOrigins: process.env.TRUSTED_ORIGINS ?? []
		}
	}
};

export default config;
