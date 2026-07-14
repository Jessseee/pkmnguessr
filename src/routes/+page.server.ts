import { getAllPokemon, getDailyPokemon } from '$lib/server/pokemon';
import type { Pokemon } from '$lib/types/Pokemon';
import { type ActionFailure, error, fail } from '@sveltejs/kit';
import { type Guess } from '$lib/types/Guess';
import { dateKey, yesterday } from '$lib/utils/date';
import { formatHints } from '$lib/utils/hints';
import { PUBLIC_MAX_GUESSES } from '$env/static/public';
import { getOrSetSessionId } from '$lib/server/session';

type GuessResult = Promise<ActionFailure<{ error: string }> | Guess>;

async function getOrSelectNewSecretPokemon(platform?: App.Platform) {
	const daily = await platform?.env?.KV.get<{ pokemon: Pokemon; date: string }>(
		'pokemon:today',
		'json'
	);

	if (daily?.date === dateKey()) {
		return daily.pokemon;
	}

	const allPokemon = await getAllPokemon(platform);
	if (!allPokemon) throw error(500, 'Pokémon data not found.');
	const pokemon = getDailyPokemon(allPokemon);
	await platform?.env?.KV.put(
		'pokemon:today',
		JSON.stringify({
			pokemon: pokemon,
			date: dateKey()
		})
	);

	return pokemon;
}

export const actions = {
	guess: async ({ request, platform, cookies }): GuessResult => {
		const secretPokemon = await getOrSelectNewSecretPokemon(platform);
		const sessionId = getOrSetSessionId(cookies);

		const data = await request.formData();
		const n = Number(data.get('n'));
		const guess = data.get('guess') as string;
		const guessedPokemon = await JSON.parse(guess);

		const madeCorrectGuess = guessedPokemon.name === secretPokemon.name;
		const reachedMaxGuesses = n >= Number(PUBLIC_MAX_GUESSES ?? 8) - 1;
		const finished = madeCorrectGuess || reachedMaxGuesses;

		if (!guessedPokemon) return fail(404, { error: 'Guessed Pokémon does not exist.' });

		if (finished) {
			let streak = await platform?.env?.KV.get<{ last: string; n: number }>(
				`session:${sessionId}:daily:streak`,
				'json'
			);

			if (madeCorrectGuess) {
				streak = {
					last: dateKey(),
					n: streak?.last === dateKey(yesterday()) ? streak.n + 1 : 1
				};
				await platform?.env?.KV.put(`session:${sessionId}:daily:streak`, JSON.stringify(streak), {
					expirationTtl: 172800 // 48 hours
				});
			} else {
				await platform?.env?.KV.delete(`session:${sessionId}:daily:streak`);
			}

			return {
				correct: madeCorrectGuess,
				answer: secretPokemon.id,
				pokemonId: guessedPokemon.id,
				hints: formatHints(guessedPokemon, secretPokemon),
				streak: streak?.n
			};
		}

		return {
			correct: madeCorrectGuess,
			pokemonId: guessedPokemon.id,
			hints: formatHints(guessedPokemon, secretPokemon)
		};
	}
};
