<script lang="ts">
	import SearchField from '$lib/components/SearchField.svelte';
	import type { Pokemon } from '$lib/types/Pokemon';
	import { enhance } from '$app/forms';
	import SearchEntry from '$lib/components/SearchEntry.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import GuessEntry from '$lib/components/GuessEntry.svelte';
	import type { Guess } from '$lib/types/Guess';
	import { filter } from '$lib/utils/filter';
	import InfoModal from '$lib/components/InfoModal.svelte';
	import { dateKey } from '$lib/utils/date';
	import { GameState } from '$lib/types/GameState';
	import { PUBLIC_MAX_GUESSES } from '$env/static/public';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { blur, slide } from 'svelte/transition';
	import { Flame, X } from '@lucide/svelte';
	import { page } from '$app/state';

	const UNOWN: Pokemon = {
		id: '0',
		name: 'Unown?',
		searchName: 'unown',
		sprite: 'sprites/pokemon/201.png',
		flavorText: 'This Pokémon does not exists, something seems to have gone wrong!',
		gen: {
			id: 2,
			name: 'Gold & Silver'
		},
		height: 0.5,
		weight: 5,
		type1: {
			id: '14',
			name: 'psychic'
		},
		shape: {
			id: '1',
			name: 'ball',
			sprite: 'sprites/shapes/Body01.png'
		}
	};

	interface StoredGuesses {
		date: string;
		guesses: Guess[];
	}

	let blurTimer: ReturnType<typeof setTimeout>;

	type Props = {
		storageKey?: string;
		gameState?: GameState;
		guesses?: Guess[];
	};

	let {
		storageKey = 'guesses',
		gameState = $bindable(GameState.Playing),
		guesses = $bindable([])
	}: Props = $props();

	let guessesLoaded = $state(false);

	let error = $state('');

	let value = $state('');
	let searchResults: Pokemon[] = $state([]);
	let searchFocused: boolean = $state(false);

	function getPokemonById(id: string | undefined): Pokemon {
		if (!id) return UNOWN;
		const pokemon = page.data.pokemon.find((_pokemon) => _pokemon.id === id);
		return pokemon ?? UNOWN;
	}

	let canSubmit = $derived(
		searchResults.length === 1 || page.data.pokemon.some((pokemon) => pokemon.name === value)
	);

	const submit: SubmitFunction = ({ formData, cancel }) => {
		error = '';

		if (canSubmit) {
			const pokemon = searchResults[0];
			value = pokemon.name;
			formData.set('guess', JSON.stringify(pokemon));
			formData.set('n', String(guesses.length));
		} else {
			error = 'Select a valid Pokémon.';
			cancel();
			return;
		}

		return async ({ result, update }) => {
			if (result.type === 'success' && result.data) {
				guesses = [result.data as Guess, ...guesses];
				value = '';
				searchResults = [];
			}

			if (result.type === 'failure') {
				error = String(result.data?.error ?? 'Invalid guess.');
			}

			await update({
				reset: false,
				invalidateAll: false
			});
		};
	};

	onMount(() => {
		const raw = localStorage.getItem(storageKey);

		if (!raw) {
			guessesLoaded = true;
			return;
		}

		try {
			const stored = JSON.parse(raw) as StoredGuesses;

			if (stored.date === dateKey()) {
				guesses = stored.guesses;
			} else {
				localStorage.removeItem(storageKey);
			}
		} catch {
			localStorage.removeItem(storageKey);
		}

		guessesLoaded = true;
	});

	$effect(() => {
		if (!browser || !guessesLoaded) return;
		localStorage.setItem(
			storageKey,
			JSON.stringify({
				date: dateKey(),
				guesses
			} satisfies StoredGuesses)
		);
	});

	$effect(() => {
		gameState = guessesLoaded
			? guesses.length > 7
				? GameState.Lost
				: guesses.at(0)?.correct
					? GameState.Won
					: GameState.Playing
			: GameState.Loading;
	});
</script>

{#if gameState === GameState.Loading}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		out:blur={{ delay: 300, duration: 300 }}
	>
		<img src={`/poke-ball/${page.data.pokeball}.png`} alt="Loading" id="loading" class="size-16" />
	</div>
{:else if gameState !== GameState.Playing}
	{@const finalGuess = guesses[0]}
	<div
		in:blur={{ delay: 200 }}
		class={[
			'flex w-full flex-col items-center rounded-2xl border-4 p-2 text-center',
			gameState === GameState.Won && 'border-green-600 bg-green-100',
			gameState === GameState.Lost && 'border-red-600 bg-red-100'
		]}
	>
		{#if gameState === GameState.Won}
			{@const pokemon = getPokemonById(finalGuess.pokemonId)}
			<h1 class="text-2xl font-bold">That's right!</h1>
			<h3>The Pokémon is <u>{pokemon.name}</u></h3>
			<SearchEntry
				class="mt-0.5 border-2 border-slate-800 drop-shadow-2xl sm:drop-shadow-none"
				{pokemon}
				showFlavorText={true}
			/>
			{#if (finalGuess.streak ?? 0) > 1}
				<div class="mt-3 mb-1 flex items-center text-xl">
					<Flame class="mr-1 size-6 text-red-600" />
					<span class="mr-1.5 font-bold underline">{finalGuess.streak}</span>
					Day Streak
				</div>
			{/if}
		{:else if gameState === GameState.Lost}
			{@const pokemon = getPokemonById(finalGuess.answer)}
			<h1 class="text-2xl font-bold">Better luck next time!</h1>
			<h3>The Pokémon was <u>{pokemon.name}</u></h3>
			<SearchEntry
				class="mt-0.5 border-2 border-slate-800 drop-shadow-2xl sm:drop-shadow-none"
				{pokemon}
				showFlavorText={true}
			/>
		{/if}
	</div>
{:else}
	<form action="?/guess" method="POST" use:enhance={submit} in:blur={{ delay: 200 }}>
		<div class="flex w-full flex-row items-stretch">
			<InfoModal />
			<SearchField
				bind:value
				bind:searchResults
				data={page.data.pokemon}
				filter={filter(guesses)}
				callback={() => (error = '')}
				onfocus={() => {
					clearTimeout(blurTimer);
					searchFocused = true;
				}}
				onblur={() => {
					blurTimer = setTimeout(() => {
						searchFocused = false;
					}, 150);
				}}
				class="ml-1 h-10 min-w-0 flex-1 rounded-l-xl border-4 border-r-0 border-slate-400 focus:ring-0"
				placeholder="Who's that Pokémon?"
			/>
			<button
				disabled={!canSubmit}
				class={[
					'box-border shrink-0 rounded-r-xl border-4 border-l-0 border-slate-400 bg-slate-50 px-3 py-1 font-bold whitespace-nowrap text-slate-500 transition-colors sm:px-6',
					'hover:cursor-pointer hover:border-slate-500 hover:bg-slate-500 hover:text-white',
					'disabled:cursor-default disabled:border-slate-400 disabled:bg-slate-50 disabled:text-slate-300'
				]}
				type="submit"
			>
				Guess
			</button>
		</div>
	</form>
{/if}
{#if searchFocused && searchResults.length > 0}
	<ul
		in:slide={{ duration: 200 }}
		class="absolute left-0 z-10 flex max-h-[calc(100svh-8rem)] touch-pan-y flex-col items-center overflow-auto drop-shadow-lg drop-shadow-slate-300 sm:left-6 sm:items-start"
	>
		{#each searchResults as pokemon (pokemon.id)}
			<SearchEntry
				{pokemon}
				onclick={() => {
					value = pokemon.name;
					searchFocused = false;
				}}
				class="border-2 border-slate-200 hover:cursor-pointer hover:border-slate-800"
			/>
		{/each}
	</ul>
{/if}
{#if guesses.length > 0}
	<div in:slide={{ delay: 200 }} class="mt-4 w-full space-y-2">
		<div
			class="grid w-full grid-cols-7 gap-1 border-b-2 pb-1 text-center max-[450px]:text-xs sm:text-lg"
		>
			<div>Guess</div>
			<div>Gen.</div>
			<div>Type1</div>
			<div>Type2</div>
			<div>Height</div>
			<div>Weight</div>
			<div>Shape</div>
		</div>
		{#each guesses as guess, i (guess.pokemonId)}
			<div animate:flip={{ duration: 300, easing: quintOut }}>
				<GuessEntry {guess} pokemon={getPokemonById(guess.pokemonId)} />
				{#if i === guesses.length - 1 && gameState === GameState.Playing}
					<div class="mt-2 text-center text-slate-700">
						You have
						<span class="font-bold underline"
							>{Number(PUBLIC_MAX_GUESSES ?? 8) - guesses.length}</span
						>
						{Number(PUBLIC_MAX_GUESSES ?? 8) - guesses.length > 1 ? 'guesses' : 'guess'} left.
					</div>
				{/if}
			</div>
		{/each}
	</div>
{:else if gameState !== GameState.Loading}
	<div
		class="mt-5 flex w-full justify-center text-center"
		in:blur={{ delay: 200 }}
		out:blur={{ duration: 200 }}
	>
		<div class="col-span-2 rounded border-2 border-slate-600 bg-white">
			<div class="rounded-xs border-x-10 border-red-400">
				<div class="border-2 border-red-300 px-5 py-2">
					<h1 class="text-2xl font-bold">Who's that Pokémon?</h1>
					<p>
						Start typing a Pokémon name to begin. You have
						<span class="font-bold underline">{Number(PUBLIC_MAX_GUESSES ?? 8)}</span> guesses.
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if error}
	<div class="absolute top-2 flex w-full justify-center" in:blur>
		<div class="flex items-center rounded-md bg-red-600 py-1 pr-2 pl-4 text-white">
			<div><b>Error:</b> {error}</div>
			<button class="ml-2 hover:cursor-pointer" onclick={() => (error = '')}>
				<X class="-mb-0.5 size-5" />
			</button>
		</div>
	</div>
{/if}

<style>
	#loading {
		animation: pokeball-drop-bounce 700ms ease-out both;
		transform-origin: center bottom;
	}

	@keyframes pokeball-drop-bounce {
		0% {
			transform: translateY(-160px) translateX(20px) scaleX(0.95) scaleY(1);
			opacity: 0;
		}

		30% {
			transform: translateY(0) scaleX(1.18) scaleY(0.95);
			opacity: 1;
		}

		50% {
			transform: translateY(-45px) scaleX(0.92) scaleY(1);
		}

		70% {
			transform: translateY(0) scaleX(1.1) scaleY(0.9);
		}

		80% {
			transform: translateY(-10px) scaleX(0.97) scaleY(1);
		}

		100% {
			transform: translateY(0) scaleX(1) scaleY(1);
			opacity: 1;
		}
	}
</style>
