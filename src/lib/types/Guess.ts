export enum Hint {
	Correct,
	Incorrect,
	Lower,
	Higher,
	OtherPosition
}
export type Hints = {
	gen: Hint;
	height: Hint;
	weight: Hint;
	type1: Hint;
	type2: Hint;
};
export type Guess = {
	answer?: string;
	correct: boolean;
	pokemonId: string;
	hints: Hints;
};
