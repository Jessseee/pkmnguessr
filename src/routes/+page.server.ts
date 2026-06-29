import { getDailyPokemon } from '$lib/server/pokemon';
import type { Pokemon } from '$lib/types/Pokemon';
import { type ActionFailure, error, fail } from '@sveltejs/kit';
import { type Guess } from '$lib/types/Guess';
import { todayKey } from '$lib/utils/date';
import { formatHints } from '$lib/utils/hints';
import { PUBLIC_MAX_GUESSES } from '$env/static/public';

type GuessResult = Promise<ActionFailure<{ error: string }> | Guess>;

export const actions = {
	guess: async ({ request, platform }): GuessResult => {
		const daily = await platform?.env?.KV.get<{ pokemon: Pokemon; date: string }>(
			'pokemon:today',
			'json'
		);

		let dailyPokemon: Pokemon;
		if (daily?.date === todayKey()) {
			dailyPokemon = daily.pokemon;
		} else {
			const pokemon = await platform?.env?.KV.get<Pokemon[]>('pokemon:all', 'json');
			if (!pokemon) throw error(500, 'Pokémon data not found.');
			dailyPokemon = getDailyPokemon(pokemon);
			await platform?.env?.KV.put(
				'pokemon:today',
				JSON.stringify({
					pokemon: dailyPokemon,
					date: todayKey()
				})
			);
		}

		const data = await request.formData();
		const n = Number(data.get('n'));
		const guess = data.get('guess') as string;
		const guessedPokemon = await JSON.parse(guess);

		if (!guessedPokemon) {
			return fail(404, { error: 'Guessed Pokémon does not exist.' });
		}

		return {
			correct: guessedPokemon.name === dailyPokemon.name,
			answer: n >= Number(PUBLIC_MAX_GUESSES ?? 8) - 1 ? dailyPokemon.id : undefined,
			pokemonId: guessedPokemon.id,
			hints: formatHints(guessedPokemon, dailyPokemon)
		};
	}
};
