const pokeballs = [
	'dive-ball',
	'dusk-ball',
	'great-ball',
	'heal-ball',
	'luxury-ball',
	'master-ball',
	'nest-ball',
	'net-ball',
	'poke-ball',
	'premier-ball',
	'quick-ball',
	'repeat-ball',
	'safari-ball',
	'timer-ball',
	'ultra-ball'
];

export function getRandomPokeball() {
	const index = Math.floor(Math.random() * pokeballs.length);
	return pokeballs[index];
}
