import type { Pokemon } from '$lib/types/Pokemon';
import { hashString, seededRandom } from '$lib/utils/crypto';

const DAY_MS = 24 * 60 * 60 * 1000;

function getUtcDayNumber(date = new Date()): number {
	return Math.floor(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / DAY_MS
	);
}

function getRandomIndexForDay(total: number, dayNumber: number, attempt = 0): number {
	const seed = hashString(`pokemon-day-${dayNumber}-attempt-${attempt}`);
	const random = seededRandom(seed);

	return Math.floor(random * total);
}

function getDailyPokemonIndex(pokemon: Pokemon[], date = new Date(), cooldownDays = 14) {
	const total = pokemon.length;

	const dayNumber = getUtcDayNumber(date);
	const blockedIndexes = new Set<number>();

	for (let offset = 1; offset <= cooldownDays; offset++) {
		const previousDate = new Date((dayNumber - offset) * DAY_MS);
		const previous = getDailyPokemonIndex(pokemon, previousDate, offset - 1);

		blockedIndexes.add(previous);
	}

	let attempt = 0;
	let index = getRandomIndexForDay(total, dayNumber, attempt);

	while (blockedIndexes.has(index)) {
		attempt++;
		index = getRandomIndexForDay(total, dayNumber, attempt);
	}

	return index;
}

export function getDailyPokemon(pokemon: Pokemon[], date = new Date(), cooldownDays = 14) {
	const index = getDailyPokemonIndex(pokemon, date, cooldownDays);
	return pokemon[index];
}

export function getRandomPokemon(pokemon: Pokemon[], seed: string) {
	const random = seededRandom(hashString(seed));
	const index = Math.floor(random * pokemon.length);
	return pokemon[index];
}
