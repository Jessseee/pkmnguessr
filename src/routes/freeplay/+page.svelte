<script lang="ts">
	import Guessr from '$lib/components/Guessr.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import { GameState } from '$lib/types/GameState';
	import type { Guess } from '$lib/types/Guess';
	import { createShareText } from '$lib/utils/share';
	import { page } from '$app/state';
	import { RotateCcw } from '@lucide/svelte';
	import SocialPreview from '$lib/components/SocialPreview.svelte';
	import { blur } from 'svelte/transition';

	const { data } = $props();

	const storageKey = 'freeplay:guesses';

	let gameState = $state(GameState.Loading);
	let guesses = $state<Guess[]>([]);
	let gameKey = $state(0);

	const shareText = $derived(
		createShareText({
			title: 'PkmnGuessr Freeplay',
			guesses,
			pokemon: data.pokemon,
			gameState,
			url: page.url.origin + page.url.pathname
		})
	);

	function again() {
		localStorage.removeItem(storageKey);
		gameState = GameState.Playing;
		guesses = [];
		gameKey += 1;
	}
</script>

<SocialPreview
	title="PkmnGuessr - Freeplay"
	description="Who's that Pokémon? Keep testing your Pokémon knowledge in PkmnGuessr freeplay for endless fun!"
/>

<div class="relative mx-auto p-4 sm:max-w-xl">
	{#if gameState !== GameState.Playing && guesses.length > 0}
		<div in:blur={{ delay: 300 }} class="mb-4 grid w-full grid-cols-[1fr_1fr_2fr] gap-2">
			<ShareButton
				text={shareText}
				title="PkmnGuessr"
				buttonClass={[
					'flex min-w-0 items-center justify-center rounded-xl border-4 border-slate-400 bg-white px-2 py-1.5 font-bold text-slate-700 transition-colors sm:px-4',
					'hover:cursor-pointer hover:bg-slate-100 hover:border-slate-600 hover:text-slate-700'
				]}
			/>

			<button
				type="button"
				onclick={again}
				class={[
					'flex min-w-0 items-center justify-center rounded-xl border-4 border-orange-500 bg-orange-100 px-2 py-1.5 font-bold text-orange-700 transition-colors sm:px-4',
					'hover:cursor-pointer hover:border-red-600 hover:bg-red-100 hover:text-red-700'
				]}
			>
				<span>Play Again</span>
				<RotateCcw class="ml-1 inline size-4 shrink-0 sm:size-5" />
			</button>
		</div>
	{/if}

	{#key gameKey}
		<div out:blur>
			<Guessr {storageKey} bind:gameState bind:guesses />
		</div>
	{/key}
</div>
