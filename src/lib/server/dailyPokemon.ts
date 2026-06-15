import type { Pokemon } from '$lib/types/Pokemon';

const DAY_MS = 24 * 60 * 60 * 1000;

function getUtcDayNumber(date = new Date()): number {
	return Math.floor(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / DAY_MS
	);
}

function hashString(value: string): number {
	let hash = 2166136261;

	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}

	return hash >>> 0;
}

function seededRandom(seed: number): number {
	seed += 0x6d2b79f5;

	let value = seed;
	value = Math.imul(value ^ (value >>> 15), value | 1);
	value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

	return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
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
