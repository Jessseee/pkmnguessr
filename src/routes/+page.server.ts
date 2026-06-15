import { getDailyPokemon } from '$lib/server/dailyPokemon';
import type { Pokemon } from '$lib/types/Pokemon';
import { type ActionFailure, error, fail } from '@sveltejs/kit';
import { type Guess, type Hints, Hint } from '$lib/types/Guess';
import { todayKey } from '$lib/utils/date';

type GuessResult = Promise<ActionFailure<{ error: string }> | Guess>;

function formatHints(guessedPokemon: Pokemon, dailyPokemon: Pokemon): Hints {
	return {
		gen:
			guessedPokemon.gen.id === dailyPokemon.gen.id
				? Hint.Correct
				: guessedPokemon.gen.id < dailyPokemon.gen.id
					? Hint.Higher
					: Hint.Lower,
		height:
			guessedPokemon.height === dailyPokemon.height
				? Hint.Correct
				: guessedPokemon.height < dailyPokemon.height
					? Hint.Higher
					: Hint.Lower,
		weight:
			guessedPokemon.weight === dailyPokemon.weight
				? Hint.Correct
				: guessedPokemon.weight < dailyPokemon.weight
					? Hint.Higher
					: Hint.Lower,
		type1:
			guessedPokemon.type1.id === dailyPokemon.type1.id
				? Hint.Correct
				: guessedPokemon.type1.id === dailyPokemon.type2?.id
					? Hint.OtherPosition
					: Hint.Incorrect,
		type2:
			guessedPokemon.type2?.id === dailyPokemon.type2?.id
				? Hint.Correct
				: guessedPokemon.type2?.id === dailyPokemon.type1.id
					? Hint.OtherPosition
					: Hint.Incorrect
	};
}

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
			answer: n === 6 ? dailyPokemon.id : null,
			pokemonId: guessedPokemon.id,
			hints: formatHints(guessedPokemon, dailyPokemon)
		};
	}
};
