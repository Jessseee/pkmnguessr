import { getRandomPokeball } from '$lib/utils/pokeball';
import { getAllPokemon } from '$lib/server/pokemon';

export async function load({ platform }) {
	const pokemon = await getAllPokemon(platform);
	const pokeball = getRandomPokeball();

	return {
		pokemon,
		pokeball
	};
}
