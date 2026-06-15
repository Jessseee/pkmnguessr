import type { Pokemon } from '$lib/types/Pokemon';
import type { Guess } from '$lib/types/Guess';

type NumericFilterKey = 'gen' | 'generation' | 'weight' | 'height' | 'id';
type StringFilterKey = 'type' | 'type1' | 'type2';

type NumericOperator = '<' | '<=' | '>' | '>=' | '=';
type StringOperator = '=' | '!=';

type SearchFilter =
	| {
			type: 'number';
			key: NumericFilterKey;
			operator: NumericOperator;
			value: number;
	  }
	| {
			type: 'string';
			key: StringFilterKey;
			operator: StringOperator;
			value: string;
	  };

interface ParsedSearch {
	text: string;
	filters: SearchFilter[];
}

const NUMERIC_FILTERS = {
	gen: (pokemon: Pokemon) => pokemon.gen.id,
	generation: (pokemon: Pokemon) => pokemon.gen.id,
	weight: (pokemon: Pokemon) => pokemon.weight,
	height: (pokemon: Pokemon) => pokemon.height,
	id: (pokemon: Pokemon) => Number(pokemon.id)
} satisfies Record<NumericFilterKey, (pokemon: Pokemon) => number>;

const STRING_FILTERS = {
	type: (pokemon: Pokemon) => [pokemon.type1?.name, pokemon.type2?.name],
	type1: (pokemon: Pokemon) => [pokemon.type1?.name],
	type2: (pokemon: Pokemon) => [pokemon.type2?.name ?? 'none']
} satisfies Record<StringFilterKey, (pokemon: Pokemon) => Array<string | undefined>>;

function isNumericFilterKey(key: string): key is NumericFilterKey {
	return key in NUMERIC_FILTERS;
}

function isStringFilterKey(key: string): key is StringFilterKey {
	return key in STRING_FILTERS;
}

export function parseSearch(value: string): ParsedSearch {
	const textParts: string[] = [];
	const filters: SearchFilter[] = [];

	for (const part of value.toLowerCase().trim().split(/\s+/)) {
		if (!part) continue;

		const match = part.match(/^([a-z0-9]+)(<=|>=|!=|=|<|>)([a-z0-9.]+)$/);

		if (!match) {
			textParts.push(part);
			continue;
		}

		const [, key, operator, rawValue] = match;

		if (isNumericFilterKey(key)) {
			const numberValue = Number(rawValue);

			if (Number.isNaN(numberValue) || !['<', '<=', '>', '>=', '='].includes(operator)) {
				textParts.push(part);
				continue;
			}

			filters.push({
				type: 'number',
				key,
				operator: operator as NumericOperator,
				value: numberValue
			});

			continue;
		}

		if (isStringFilterKey(key) && (operator === '=' || operator === '!=')) {
			filters.push({
				type: 'string',
				key,
				operator,
				value: rawValue
			});

			continue;
		}

		textParts.push(part);
	}

	return {
		text: textParts.join(' '),
		filters
	};
}

function matchesNumericFilter(
	pokemon: Pokemon,
	filter: Extract<SearchFilter, { type: 'number' }>
): boolean {
	const value = NUMERIC_FILTERS[filter.key](pokemon);

	switch (filter.operator) {
		case '<':
			return value < filter.value;
		case '<=':
			return value <= filter.value;
		case '>':
			return value > filter.value;
		case '>=':
			return value >= filter.value;
		case '=':
			return value === filter.value;
	}
}

function matchesStringFilter(
	pokemon: Pokemon,
	filter: Extract<SearchFilter, { type: 'string' }>
): boolean {
	const values = STRING_FILTERS[filter.key](pokemon);
	const matches = values.includes(filter.value);

	return filter.operator === '=' ? matches : !matches;
}

function matchesFilter(pokemon: Pokemon, filter: SearchFilter): boolean {
	return filter.type === 'number'
		? matchesNumericFilter(pokemon, filter)
		: matchesStringFilter(pokemon, filter);
}

export function filter(guesses: Guess[]) {
	return (pokemon: Pokemon, value: string) => {
		const { text, filters } = parseSearch(value);

		const matchesText = !text || pokemon.searchName.includes(text);
		const matchesFilters = filters.every((filter) => matchesFilter(pokemon, filter));
		const isNotGuessed = !guesses.some((guess) => guess.pokemonId === pokemon.id);

		return matchesText && matchesFilters && isNotGuessed;
	};
}
