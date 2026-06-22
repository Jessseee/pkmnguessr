import { Hint, type Hints } from '$lib/types/Guess';
import type { Pokemon } from '$lib/types/Pokemon';

export function formatHints(guessedPokemon: Pokemon, secretPokemon: Pokemon): Hints {
	return {
		gen:
			guessedPokemon.gen.id === secretPokemon.gen.id
				? Hint.Correct
				: guessedPokemon.gen.id < secretPokemon.gen.id
					? Hint.Higher
					: Hint.Lower,
		height:
			guessedPokemon.height === secretPokemon.height
				? Hint.Correct
				: guessedPokemon.height < secretPokemon.height
					? Hint.Higher
					: Hint.Lower,
		weight:
			guessedPokemon.weight === secretPokemon.weight
				? Hint.Correct
				: guessedPokemon.weight < secretPokemon.weight
					? Hint.Higher
					: Hint.Lower,
		type1:
			guessedPokemon.type1.id === secretPokemon.type1.id
				? Hint.Correct
				: guessedPokemon.type1.id === secretPokemon.type2?.id
					? Hint.OtherPosition
					: Hint.Incorrect,
		type2:
			guessedPokemon.type2?.id === secretPokemon.type2?.id
				? Hint.Correct
				: guessedPokemon.type2?.id === secretPokemon.type1.id
					? Hint.OtherPosition
					: Hint.Incorrect,
		shape: guessedPokemon.shape.id === secretPokemon.shape.id ? Hint.Correct : Hint.Incorrect
	};
}
