<script lang="ts">
	import Guessr from '$lib/components/Guessr.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import { GameState } from '$lib/types/GameState';
	import type { Guess } from '$lib/types/Guess';
	import { createShareText } from '$lib/utils/share';
	import { page } from '$app/state';
	import { todayKey } from '$lib/utils/date';
	import Countdown from '$lib/components/Countdown.svelte';
	import { RefreshCw } from '@lucide/svelte';
	import SocialPreview from '$lib/components/SocialPreview.svelte';

	const { data } = $props();

	const storageKey = 'daily:guesses';

	let gameState = $state(GameState.Loading);
	let guesses = $state<Guess[]>([]);
	let gameKey = $state(0);

	const shareText = $derived(
		createShareText({
			title: `PkmnGuessr Daily - ${todayKey()}`,
			guesses,
			pokemon: data.pokemon,
			gameState,
			url: page.url.origin + page.url.pathname
		})
	);
</script>

<SocialPreview
	title="PkmnGuessr - Daily"
	description="Who's that Pokémon? Identify the daily mystery Pokémon before you run out of guesses."
/>

<div class="relative mx-auto p-4 sm:max-w-xl">
	{#if gameState !== GameState.Playing && guesses.length > 0}
		<div class="mb-4 grid w-full grid-cols-3 gap-2">
			<ShareButton
				text={shareText}
				title="PkmnGuessr"
				buttonClass={[
					'flex min-w-0 items-center justify-center rounded-xl border-4 border-slate-400 bg-white px-2 py-1.5 font-bold text-slate-700 transition-colors sm:px-4',
					'hover:cursor-pointer hover:bg-slate-100 hover:border-slate-600 hover:text-slate-700'
				]}
			/>
			<div
				class={[
					'flex min-w-0 items-center justify-center rounded-xl border-4 border-slate-400 bg-white px-2 py-1.5 font-bold text-slate-700 transition-colors sm:px-4',
					'border-slate-300! select-none'
				]}
			>
				<RefreshCw class="size-4 sm:size-5" />
				<Countdown class="ml-1.5" />
			</div>
		</div>
	{/if}

	{#key gameKey}
		<Guessr {storageKey} bind:gameState bind:guesses />
	{/key}
</div>
