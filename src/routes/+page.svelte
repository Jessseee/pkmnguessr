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
	import { GitFork } from '@lucide/svelte';
	import { todayKey } from '$lib/utils/date';

	const STORAGE_KEY = 'guesses';
	const UNOWN: Pokemon = {
		id: '201',
		name: 'Unown?',
		searchName: 'unown',
		sprite: 'sprites/pokemon/201.png',
		flavorText:
			'Their shapes look like hieroglyphs on ancient tablets. It is said that the two are somehow related.',
		gen: {
			id: 2,
			name: 'Gold & Silver'
		},
		height: 0.5,
		weight: 5,
		type1: {
			id: '14',
			name: 'psychic'
		}
	};

	interface StoredGuesses {
		date: string;
		guesses: Guess[];
	}

	let blurTimer: ReturnType<typeof setTimeout>;

	let { data } = $props();

	let guesses: Guess[] = $state([]);
	let guessesLoaded = $state(false);

	let error = $state('');

	let value = $state('');
	let searchResults: Pokemon[] = $state([]);
	let searchFocused: boolean = $state(false);

	const won = $derived(Boolean(guesses.at(0)?.correct) && guesses.length <= 7);
	const lost = $derived(guesses.length >= 7);
	const finished = $derived(won || lost);

	function getPokemonById(id: string | null): Pokemon {
		if (!id) return UNOWN;
		const pokemon = data.pokemon.find((_pokemon) => _pokemon.id === id);
		return pokemon ?? UNOWN;
	}

	let canSubmit = $derived(
		searchResults.length === 1 || data.pokemon.some((pokemon) => pokemon.name === value)
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
		const raw = localStorage.getItem(STORAGE_KEY);

		if (!raw) {
			guessesLoaded = true;
			return;
		}

		try {
			const stored = JSON.parse(raw) as StoredGuesses;

			if (stored.date === todayKey()) {
				guesses = stored.guesses;
			} else {
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch {
			localStorage.removeItem(STORAGE_KEY);
		}

		guessesLoaded = true;
	});

	$effect(() => {
		if (!browser || !guessesLoaded) return;
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				date: todayKey(),
				guesses
			} satisfies StoredGuesses)
		);
	});
</script>

<div class="relative mx-auto p-4 sm:max-w-xl">
	{#if finished}
		<div
			class={[
				'flex w-full flex-col items-center rounded-2xl border-4 p-2 text-center',
				won && 'border-green-600 bg-green-100',
				lost && 'border-red-600 bg-red-100'
			]}
		>
			{#if won}
				{@const pokemon = getPokemonById(guesses[0].pokemonId)}
				<h1 class="text-2xl font-bold">That is right!</h1>
				<h3>Today's pokemon is <u>{pokemon.name}</u></h3>
				<SearchEntry class="mt-0.5 border-2 border-slate-800" {pokemon} showFlavorText={true} />
			{:else if lost}
				{@const pokemon = getPokemonById(guesses[0].answer)}
				<h1 class="text-2xl font-bold">Better luck tomorrow!</h1>
				<h3>Today's pokemon is <u>{pokemon.name}</u></h3>
				<SearchEntry class="mt-0.5 border-2 border-slate-800" {pokemon} showFlavorText={true} />
			{/if}
		</div>
	{:else}
		<form action="?/guess" method="POST" use:enhance={submit}>
			<div class="flex flex-row items-stretch">
				<InfoModal />
				<SearchField
					bind:value
					bind:searchResults
					data={data.pokemon}
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
					class="ml-1 h-10 w-100 rounded-l-xl border-4 border-r-0 border-slate-400 focus:ring-0"
					placeholder="Who's that Pokémon?"
				/>
				<button
					disabled={!canSubmit}
					class="box-border w-40 rounded-r-xl border-4 border-l-0 border-slate-400 bg-slate-50 font-bold text-slate-500 transition-colors hover:cursor-pointer hover:border-slate-500 hover:bg-slate-500 hover:text-white disabled:cursor-default disabled:border-slate-400 disabled:bg-slate-50 disabled:text-slate-300"
					type="submit"
				>
					Guess
				</button>
			</div>
		</form>
	{/if}
	{#if searchFocused && searchResults.length > 0}
		<ul
			class="absolute left-0 z-10 flex max-h-[calc(100svh-5rem)] touch-pan-y flex-col items-center overflow-auto drop-shadow-lg drop-shadow-slate-300 sm:left-6 sm:items-start"
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
		<div class="mt-4 w-full space-y-2">
			<div
				class="grid w-full grid-cols-6 gap-1 border-b-2 pb-1 text-center max-[450px]:text-xs sm:text-lg"
			>
				<div>Pokemon</div>
				<div>Gen.</div>
				<div>Type1</div>
				<div>Type2</div>
				<div>Height</div>
				<div>Weight</div>
			</div>
			{#each guesses as guess (guess.pokemonId)}
				<GuessEntry {guess} pokemon={getPokemonById(guess.pokemonId)} />
			{/each}
		</div>
	{:else}
		<div class="mt-5 flex w-full justify-center text-center">
			<div class="col-span-2 rounded border-2 border-slate-600 bg-white">
				<div class="rounded-xs border-x-10 border-red-400">
					<div class="border-2 border-red-300 px-5 py-2">
						<h1 class="text-2xl font-bold">Who's that Pokémon?</h1>
						<p>Start typing a Pokémon name to begin.</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
<div class="absolute flex w-full justify-center">
	{#if error}
		<span class="rounded-md bg-red-600 px-4 py-1 text-white">Error: {error}</span>
	{/if}
</div>
<a
	href="https://github.com/jessseee/pkmnguessr"
	class="absolute right-2 bottom-2 rounded-xl px-4 py-1 font-bold text-slate-600 transition-colors hover:bg-white hover:text-slate-800"
>
	Source <GitFork class="ml-0.5 inline size-6" />
</a>
