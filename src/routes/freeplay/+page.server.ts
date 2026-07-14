import type { Pokemon } from '$lib/types/Pokemon';
import { type ActionFailure, fail } from '@sveltejs/kit';
import { type Guess } from '$lib/types/Guess';
import { formatHints } from '$lib/utils/hints';
import { getAllPokemon, getRandomPokemon } from '$lib/server/pokemon';
import { PUBLIC_MAX_GUESSES } from '$env/static/public';
import { getOrSetSessionId } from '$lib/server/session';

type GuessResult = Promise<ActionFailure<{ error: string }> | Guess>;

async function selectSecretPokemonForSession(sessionId: string, platform?: App.Platform) {
	const allPokemon = await getAllPokemon(platform);
	const selectedPokemon = getRandomPokemon(allPokemon, `${sessionId}-${new Date().toISOString()}`);
	await platform?.env?.KV.put(`session:${sessionId}:freeplay`, JSON.stringify(selectedPokemon), {
		expirationTtl: 86400 // 24 hours
	});
	return selectedPokemon;
}

async function getOrSetNewPokemonForSession(sessionId: string, platform?: App.Platform) {
	const pokemon = await platform?.env?.KV.get<Pokemon>(`session:${sessionId}:freeplay`, 'json');
	if (!pokemon) return selectSecretPokemonForSession(sessionId, platform);
	return pokemon;
}

export const actions = {
	guess: async ({ request, platform, cookies }): GuessResult => {
		const sessionId = getOrSetSessionId(cookies);
		const secretPokemon = await getOrSetNewPokemonForSession(sessionId, platform);

		const data = await request.formData();
		const n = Number(data.get('n'));
		const guess = data.get('guess') as string;
		const guessedPokemon = await JSON.parse(guess);

		if (!guessedPokemon) {
			return fail(404, { error: 'Guessed Pokémon does not exist.' });
		}

		const correct = guessedPokemon.name === secretPokemon.name;

		if (correct || n >= Number(PUBLIC_MAX_GUESSES ?? 8) - 1) {
			await platform?.env?.KV.delete(`session:${sessionId}:freeplay`);
		}

		return {
			correct,
			answer: n >= Number(PUBLIC_MAX_GUESSES ?? 8) - 1 ? secretPokemon.id : undefined,
			pokemonId: guessedPokemon.id,
			hints: formatHints(guessedPokemon, secretPokemon)
		};
	}
};
