// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Pokemon } from '$lib/types/Pokemon.ts';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}
		interface PageData {
			pokeball: string;
			pokemon: Pokemon[];
		}
	}
}

export {};
