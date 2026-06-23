<script lang="ts">
	import { page } from '$app/state';
	import { GitFork, Menu, X } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let menuOpen = $state(false);

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

{#snippet items(props: HTMLAnchorAttributes = {})}
	{#if page.url.pathname === '/freeplay'}
		<a
			{...props}
			href={resolve('/')}
			class={[
				props.class,
				'rounded-xl border-4 border-slate-300 px-4 py-1.5 font-bold text-slate-700 transition-colors',
				'hover:border-red-400 hover:bg-red-50 hover:text-red-600'
			]}
		>
			Daily
		</a>
	{:else}
		<a
			{...props}
			href={resolve('/freeplay')}
			class={[
				props.class,
				'rounded-xl border-4 border-slate-300 px-4 py-1.5 font-bold text-slate-700 transition-colors',
				'hover:border-green-400 hover:bg-red-50 hover:text-green-600'
			]}
		>
			Freeplay
		</a>
	{/if}

	<a
		{...props}
		href="https://github.com/jessseee/pkmnguessr"
		target="_blank"
		rel="noreferrer"
		class={[
			props.class,
			'rounded-xl px-4 py-1.5 text-sm font-bold text-slate-600 transition-colors',
			'hover:bg-slate-100 hover:text-slate-900'
		]}
	>
		Source <GitFork class="ml-0.5 inline size-5" />
	</a>
{/snippet}

<header class="top-0 z-50 w-full border-b border-slate-200 bg-white drop-shadow">
	<nav class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 pt-1.5 pb-1">
		<a
			href={resolve('/')}
			class="flex min-w-0 items-center justify-center text-xl font-black tracking-tight text-slate-800 transition-colors hover:text-red-500"
			onclick={() => (menuOpen = false)}
		>
			<img src="/poke-ball/{pokeball}.png" alt="logo" class="mr-1.5 inline size-5" />
			PkmnGuessr
			<span class="ml-1 font-medium text-lg">{page.url.pathname === '/freeplay' ? '| Freeplay' : ''}</span>
		</a>

		<button
			type="button"
			class="rounded-xl p-2 text-slate-700 transition-colors hover:bg-slate-100 sm:hidden"
			aria-label="Toggle menu"
			aria-expanded={menuOpen}
			aria-controls="mobile-menu"
			onclick={() => (menuOpen = !menuOpen)}
		>
			{#if menuOpen}
				<X class="size-5" />
			{:else}
				<Menu class="size-5" />
			{/if}
		</button>

		<div class="hidden items-center gap-2 sm:flex">
			{@render items()}
		</div>

		{#if menuOpen}
			<div
				id="mobile-menu"
				class="flex w-full flex-col gap-2 pb-2 sm:hidden text-center"
				transition:slide={{ duration: 180, easing: quintOut }}
			>
				{@render items({ onclick: () => menuOpen = false })}
			</div>
		{/if}
	</nav>
</header>