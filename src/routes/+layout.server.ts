import { error } from '@sveltejs/kit';
import type { Pokemon } from '$lib/types/Pokemon';

export async function load({ platform }) {
	const pokemon = await platform?.env?.KV.get<Pokemon[]>('pokemon:all', 'json');

	if (!pokemon) {
		throw error(500, 'Pokémon data not found.');
	}

	return {
		pokemon
	};
}
