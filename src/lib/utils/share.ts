import { GameState } from '$lib/types/GameState';
import type { Guess } from '$lib/types/Guess';
import type { Pokemon } from '$lib/types/Pokemon';
import { PUBLIC_MAX_GUESSES } from '$env/static/public';

const HIT = '🟩';
const CLOSE = '🟨';
const MISS = '⬛';
const UP = '⬆️';
const DOWN = '⬇️';

export function createShareText({
	title = 'PkmnGuessr',
	guesses,
	pokemon,
	gameState,
	url
}: {
	title?: string;
	guesses: Guess[];
	pokemon: Pokemon[];
	gameState: GameState;
	url?: string;
}) {
	const orderedGuesses = [...guesses].reverse();

	const answerId = guesses[0]?.answer ?? orderedGuesses.find((guess) => guess.correct)?.pokemonId;

	const answer = pokemon.find((p) => p.id === answerId);

	const score =
		gameState === GameState.Won
			? `${orderedGuesses.length}/${PUBLIC_MAX_GUESSES}`
			: `X/${PUBLIC_MAX_GUESSES}`;

	const rows = answer ? orderedGuesses.map((guess) => createGuessRow(guess, pokemon, answer)) : [];

	return [`${title} (${score})`, '', ...rows, url ? `\n${url}` : ''].filter(Boolean).join('\n');
}

function createGuessRow(guess: Guess, allPokemon: Pokemon[], answer: Pokemon) {
	const guessed = allPokemon.find((p) => p.id === guess.pokemonId);

	if (!guessed) return MISS.repeat(6);

	return [
		guessed.id === answer.id ? HIT : MISS,
		guessed.gen.id === answer.gen.id ? HIT : MISS,
		typeTile(guessed.type1?.name, answer.type1?.name, answer.type2?.name),
		typeTile(guessed.type2?.name, answer.type2?.name, answer.type1?.name),
		numberTile(guessed.height, answer.height),
		numberTile(guessed.weight, answer.weight)
	].join('');
}

function typeTile(
	guessType: string | undefined,
	exactType: string | undefined,
	otherType: string | undefined
) {
	if (!guessType && !exactType) return HIT;
	if (!guessType) return MISS;
	if (guessType === exactType) return HIT;
	if (guessType === otherType) return CLOSE;
	return MISS;
}

function numberTile(guessValue: number, answerValue: number) {
	if (guessValue === answerValue) return HIT;
	return guessValue < answerValue ? UP : DOWN;
}
