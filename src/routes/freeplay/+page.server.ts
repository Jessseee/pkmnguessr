import type { Pokemon } from '$lib/types/Pokemon';
import { type ActionFailure, error, fail } from '@sveltejs/kit';
import { type Guess } from '$lib/types/Guess';
import { formatHints } from '$lib/utils/hints';
import { getRandomPokemon } from '$lib/server/pokemon';
import { randomBytes } from 'crypto';
import { PUBLIC_MAX_GUESSES } from '$env/static/public';

type GuessResult = Promise<ActionFailure<{ error: string }> | Guess>;

async function selectRandomPokemonForSession(platform?: App.Platform, sessionId?: string) {
	if (!sessionId) throw error(500, 'No session ID.');
	const allPokemon = await platform?.env?.KV.get<Pokemon[]>('pokemon:all', 'json');
	if (!allPokemon) throw error(500, 'Pokémon data not found.');
	const selectedPokemon = getRandomPokemon(allPokemon, `${sessionId}-${new Date().toISOString()}`);
	await platform?.env?.KV.put(`session:${sessionId}:freeplay`, JSON.stringify(selectedPokemon));
	return selectedPokemon;
}

export const actions = {
	guess: async ({ request, platform, cookies }): GuessResult => {
		let secretPokemon: Pokemon;
		const sessionId = cookies.get('session');
		if (!sessionId) {
			const sessionId = randomBytes(16).toString('hex');
			cookies.set('session', sessionId, { path: '/' });
			secretPokemon = await selectRandomPokemonForSession(platform, sessionId)
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
			await selectRandomPokemonForSession(platform, sessionId)
		}

		return {
			correct,
			answer: n >= Number(PUBLIC_MAX_GUESSES ?? 8) - 1 ? secretPokemon.id : undefined,
			pokemonId: guessedPokemon.id,
			hints: formatHints(guessedPokemon, secretPokemon)
		};
	}
};
