<script lang="ts">
	import { page } from '$app/state';
	import { GitFork } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	const pokeballs = [
		'dive-ball',
		'dusk-ball',
		'great-ball',
		'heal-ball',
		'luxury-ball',
		'master-ball',
		'nest-ball',
		'net-ball',
		'poke-ball',
		'premier-ball',
		'quick-ball',
		'repeat-ball',
		'safari-ball',
		'timer-ball',
		'ultra-ball'
	];

	const index = Math.floor(Math.random() * pokeballs.length);
	const pokeball = pokeballs[index];
</script>

<header class="top-0 z-50 w-full border-b border-slate-200 bg-white drop-shadow">
	<nav class="mx-auto flex max-w-3xl flex-row items-center justify-between gap-3 px-4 pt-1.5 pb-1">
		<a
			href={resolve('/')}
			class="flex min-w-0 items-center justify-center text-xl font-black tracking-tight text-slate-800 transition-colors hover:text-red-500"
		>
			<img src="/poke-ball/{pokeball}.png" alt="logo" class="mr-1.5 inline size-5" />
			PkmnGuessr
		</a>

		<div class="flex items-center gap-2">
			{#if page.url.pathname === '/freeplay'}
				<a
					href={resolve('/')}
					class={[
						'rounded-xl border-4 border-slate-300 px-2 py-0.5 font-bold text-slate-700 transition-colors sm:px-4 sm:py-1.5',
						'hover:border-red-400 hover:bg-red-50 hover:text-red-600'
					]}
				>
					Daily
				</a>
			{:else}
				<a
					href={resolve('/freeplay')}
					class={[
						'rounded-xl border-4 border-slate-300 px-2 py-0.5 font-bold text-slate-700 transition-colors sm:px-4 sm:py-1.5',
						'hover:border-green-400 hover:bg-red-50 hover:text-green-600'
					]}
				>
					Freeplay
				</a>
			{/if}

			<a
				href="https://github.com/jessseee/pkmnguessr"
				target="_blank"
				rel="noreferrer"
				class={[
					'rounded-xl px-2 py-0.5 text-sm font-bold text-slate-600 transition-colors sm:px-4 sm:py-1.5',
					'hover:bg-slate-100 hover:text-slate-900'
				]}
			>
				Source <GitFork class="ml-0.5 inline size-4 sm:size-5" />
			</a>
		</div>
	</nav>
</header>
