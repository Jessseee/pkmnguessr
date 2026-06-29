import { getAllPokemon, getDailyPokemon } from '$lib/server/pokemon';
import type { Pokemon } from '$lib/types/Pokemon';
import { type ActionFailure, error, fail } from '@sveltejs/kit';
import { type Guess } from '$lib/types/Guess';
import { todayKey } from '$lib/utils/date';
import { formatHints } from '$lib/utils/hints';
import { PUBLIC_MAX_GUESSES } from '$env/static/public';

type GuessResult = Promise<ActionFailure<{ error: string }> | Guess>;

async function getSecretPokemon(platform?: App.Platform) {
	const daily = await platform?.env?.KV.get<{ pokemon: Pokemon; date: string }>(
		'pokemon:today',
		'json'
	);

	if (daily?.date === todayKey()) {
		return daily.pokemon;
	}

	const allPokemon = await getAllPokemon(platform);
	if (!allPokemon) throw error(500, 'Pokémon data not found.');
	const pokemon = getDailyPokemon(allPokemon);
	await platform?.env?.KV.put(
		'pokemon:today',
		JSON.stringify({
			pokemon: pokemon,
			date: todayKey()
		})
	);

	return pokemon;
}

export const actions = {
	guess: async ({ request, platform }): GuessResult => {
		const secretPokemon = await getSecretPokemon(platform);

		const data = await request.formData();
		const n = Number(data.get('n'));
		const guess = data.get('guess') as string;
		const guessedPokemon = await JSON.parse(guess);

		if (!guessedPokemon) return fail(404, { error: 'Guessed Pokémon does not exist.' });

		return {
			correct: guessedPokemon.name === secretPokemon.name,
			answer: n >= Number(PUBLIC_MAX_GUESSES ?? 8) - 1 ? secretPokemon.id : undefined,
			pokemonId: guessedPokemon.id,
			hints: formatHints(guessedPokemon, secretPokemon)
		};
	}
};
