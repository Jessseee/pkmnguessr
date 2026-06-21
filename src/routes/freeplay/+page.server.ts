import type { Pokemon } from '$lib/types/Pokemon';
import { type ActionFailure, error, fail } from '@sveltejs/kit';
import { type Guess } from '$lib/types/Guess';
import { formatHints } from '$lib/utils/hints';
import { getRandomPokemon } from '$lib/server/randomPokemon';
import { randomBytes } from 'crypto';
import { PUBLIC_MAX_GUESSES } from '$env/static/public';

type GuessResult = Promise<ActionFailure<{ error: string }> | Guess>;

export const actions = {
	guess: async ({ request, platform, cookies }): GuessResult => {
		let secretPokemon: Pokemon;
		const sessionId = cookies.get('session');
		if (!sessionId) {
			const allPokemon = await platform?.env?.KV.get<Pokemon[]>('pokemon:all', 'json');
			if (!allPokemon) throw error(500, 'Pokémon data not found.');
			const sessionId = randomBytes(16).toString('hex');
			const pokemon = getRandomPokemon(allPokemon, `${sessionId}-${new Date().toISOString()}`);
			cookies.set('session', sessionId, { path: '/' });
			secretPokemon = pokemon;
			await platform?.env?.KV.put(`session:${sessionId}:freeplay`, JSON.stringify(secretPokemon));
		} else {
			const pokemon = await platform?.env?.KV.get<Pokemon>(`session:${sessionId}:freeplay`, 'json');
			if (!pokemon) throw error(500, 'Pokémon data not found.');
			secretPokemon = pokemon;
		}

		const data = await request.formData();
		const n = Number(data.get('n'));
		const guess = data.get('guess') as string;
		const guessedPokemon = await JSON.parse(guess);

		if (!guessedPokemon) {
			return fail(404, { error: 'Guessed Pokémon does not exist.' });
		}

		const correct = guessedPokemon.name === secretPokemon.name;

		if (correct || n >= Number(PUBLIC_MAX_GUESSES ?? 8) - 1) {
			const allPokemon = await platform?.env?.KV.get<Pokemon[]>('pokemon:all', 'json');
			if (!allPokemon) throw error(500, 'Pokémon data not found.');
			const pokemon = getRandomPokemon(allPokemon, `${sessionId}-${new Date().toISOString()}`);
			await platform?.env?.KV.put(`session:${sessionId}:freeplay`, JSON.stringify(pokemon));
		}

		return {
			correct,
			answer: n >= Number(PUBLIC_MAX_GUESSES ?? 8) - 1 ? secretPokemon.id : undefined,
			pokemonId: guessedPokemon.id,
			hints: formatHints(guessedPokemon, secretPokemon)
		};
	}
};
