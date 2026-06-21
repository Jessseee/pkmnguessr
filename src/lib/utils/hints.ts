import { Hint, type Hints } from '$lib/types/Guess';
import type { Pokemon } from '$lib/types/Pokemon';

export function formatHints(guessedPokemon: Pokemon, dailyPokemon: Pokemon): Hints {
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
