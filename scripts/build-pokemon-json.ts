import { mkdir, writeFile } from 'node:fs/promises';
import {
	GameClient,
	PokemonClient,
	type Pokemon as PokenodePokemon,
	type PokemonSpeciesVariety
} from 'pokenode-ts';
import type { Pokemon, Type } from '../src/lib/types/Pokemon';
import { createProgressBar, limitedConcurrency } from './concurrency';

const pokemonApi = new PokemonClient();
const gameApi = new GameClient();

const WORKERS = 5;
const RAW_SPRITES_PREFIX = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/';

const GAME_NAME_OVERRIDES: Record<string, string> = {
	heartgold: 'HeartGold',
	soulsilver: 'SoulSilver',
	firered: 'FireRed',
	leafgreen: 'LeafGreen'
};

const REGIONAL_PREFIXES = {
	alola: 'Alolan',
	galar: 'Galarian',
	hisui: 'Hisuian',
	paldea: 'Paldean'
} as const;

const FORM_RULES = {
	alwaysIncludedSuffixes: ['-gmax'],
	cosmeticSuffixes: ['-cap', '-cosplay', '-totem'],
	cosmeticSpecies: new Set([
		'alcremie',
		'furfrou',
		'vivillon',
		'unown',
		'minior',
		'flabebe',
		'floette',
		'florges',
		'squawkabilly',
		'pikachu',
		'eevee'
	])
};

type Region = keyof typeof REGIONAL_PREFIXES;
type Species = Awaited<ReturnType<typeof pokemonApi.getPokemonSpeciesByName>>;

function toTitleCase(value: string): string {
	return value
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function getIdFromUrl(url: string): string {
	const id = url.split('/').at(-2);
	if (!id) throw new Error(`Could not get id from URL: ${url}`);
	return id;
}

function toLocalSpriteUrl(spriteUrl?: string | null): string | undefined {
	if (!spriteUrl) return undefined;

	return spriteUrl.startsWith(RAW_SPRITES_PREFIX)
		? spriteUrl.slice(RAW_SPRITES_PREFIX.length)
		: spriteUrl;
}

function getSprite(pokemon?: PokenodePokemon): string | undefined {
	return toLocalSpriteUrl(pokemon?.sprites.front_default);
}

function hasAnySuffix(name: string, suffixes: string[]): boolean {
	return suffixes.some((suffix) => name.endsWith(suffix));
}

function getBaseName(name: string): string {
	return name.split('-')[0];
}

function isAlwaysIncludedForm(name: string): boolean {
	return hasAnySuffix(name, FORM_RULES.alwaysIncludedSuffixes);
}

function isCosmeticForm(name: string): boolean {
	if (isAlwaysIncludedForm(name)) return false;

	return (
		FORM_RULES.cosmeticSpecies.has(getBaseName(name)) ||
		FORM_RULES.cosmeticSuffixes.some((suffix) => name.includes(suffix))
	);
}

function shouldIncludeVariety(variety: PokemonSpeciesVariety): boolean {
	return variety.is_default || !isCosmeticForm(variety.pokemon.name);
}

function toDisplayPokemonName(name: string): string {
	if (name.endsWith('-gmax')) {
		return `G-Max ${toTitleCase(name.replace(/-gmax$/, ''))}`;
	}

	const megaMatch = name.match(/^(.+)-mega(?:-(.+))?$/);

	if (megaMatch) {
		const [, baseName, formName] = megaMatch;
		return ['Mega', toTitleCase(baseName), formName && toTitleCase(formName)]
			.filter(Boolean)
			.join(' ');
	}

	const region = (Object.keys(REGIONAL_PREFIXES) as Region[]).find((region) =>
		name.includes(`-${region}`)
	);

	if (!region) return toTitleCase(name);

	const marker = `-${region}`;
	const markerIndex = name.indexOf(marker);
	const baseName = name.slice(0, markerIndex);
	const formName = name.slice(markerIndex + marker.length + 1);
	const prefix = REGIONAL_PREFIXES[region];

	return formName
		? `${prefix} ${toTitleCase(baseName)} (${toTitleCase(formName)})`
		: `${prefix} ${toTitleCase(baseName)}`;
}

function formatGameName(name: string): string {
	const normalizedName = name.replace(/-(japan|korea|asia|europe|america)$/, '');

	return GAME_NAME_OVERRIDES[normalizedName] ?? toTitleCase(normalizedName);
}

function formatGamePair(names: string[]): string {
	return names.map(formatGameName).join(' & ');
}

async function getAllSpecies() {
	const firstPage = await pokemonApi.listPokemonSpecies(0, 1);
	const allSpecies = await pokemonApi.listPokemonSpecies(0, firstPage.count);

	return allSpecies.results;
}

async function getGeneration(pokemon: PokenodePokemon): Promise<{ id: number; name: string }> {
	const formUrl = pokemon.forms[0]?.url;

	if (!formUrl) {
		throw new Error(`No forms found for Pokémon: ${pokemon.name}`);
	}

	const form = await pokemonApi.getPokemonFormById(Number(getIdFromUrl(formUrl)));
	const versionGroup = await gameApi.getVersionGroupByName(form.version_group.name);

	return {
		id: Number(getIdFromUrl(versionGroup.generation.url)),
		name: formatGamePair(versionGroup.versions.map((version) => version.name))
	};
}

function toPokemonType(entry: PokenodePokemon['types'][number]): Type {
	const id = getIdFromUrl(entry.type.url);

	return {
		id,
		name: entry.type.name
	};
}

function uniqueVarieties(varieties: PokemonSpeciesVariety[]): PokemonSpeciesVariety[] {
	const seen = new Set<string>();

	return varieties.filter((variety) => {
		const id = getIdFromUrl(variety.pokemon.url);

		if (seen.has(id)) return false;

		seen.add(id);
		return true;
	});
}

async function getPokemonById(varieties: PokemonSpeciesVariety[]) {
	const unique = uniqueVarieties(varieties);

	const entries = await limitedConcurrency(
		unique,
		WORKERS,
		async (variety) => {
			const id = getIdFromUrl(variety.pokemon.url);
			const pokemon = await pokemonApi.getPokemonById(Number(id));

			return [id, pokemon] as const;
		},
		createProgressBar('Fetching Pokémon', unique.length)
	);

	return new Map(entries);
}

function getAltSpritesByDefaultId(
	species: Species[],
	pokemonById: Map<string, PokenodePokemon>
): Map<string, string[]> {
	const altSpritesByDefaultId = new Map<string, string[]>();

	for (const entry of species) {
		const defaultVariety = entry.varieties.find((variety) => variety.is_default);
		if (!defaultVariety) continue;

		const defaultId = getIdFromUrl(defaultVariety.pokemon.url);
		const defaultSprite = getSprite(pokemonById.get(defaultId));
		if (!defaultSprite) continue;

		const altSprites = entry.varieties
			.filter((variety) => !variety.is_default && isCosmeticForm(variety.pokemon.name))
			.map((variety) => getSprite(pokemonById.get(getIdFromUrl(variety.pokemon.url))))
			.filter((sprite): sprite is string => Boolean(sprite));

		if (altSprites.length > 0) {
			altSpritesByDefaultId.set(defaultId, [defaultSprite, ...altSprites]);
		}
	}

	return altSpritesByDefaultId;
}

function toReadableAllCapsWord(value: string): string {
	const lower = value.toLocaleLowerCase('en-US');
	return lower.charAt(0).toLocaleUpperCase('en-US') + lower.slice(1);
}

function getFlavorText(species: Species): string | undefined {
	const entry = species.flavor_text_entries.find((entry) => entry.language.name === 'en');
	if (!entry) return undefined;
	return entry.flavor_text
		.replace(/\f/g, ' ')
		.replace(/\n/g, ' ')
		.replace(/\u00ad\s*/g, '')
		.replace(/\s+/g, ' ')
		.replace(/\bpok[eé]mon\b/gi, 'Pokémon')
		.replace(/\b\p{Lu}[\p{Lu}'’.-]+\b/gu, toReadableAllCapsWord)
		.trim();
}

async function toPokemon(
	species: Species,
	variety: PokemonSpeciesVariety,
	pokemonById: Map<string, PokenodePokemon>,
	altSpritesByDefaultId: Map<string, string[]>
): Promise<Pokemon | undefined> {
	const id = getIdFromUrl(variety.pokemon.url);
	const pokemon = pokemonById.get(id);
	const sprite = getSprite(pokemon);

	if (!pokemon || !sprite) return undefined;

	const name = toDisplayPokemonName(variety.pokemon.name);
	const types = pokemon.types.toSorted((a, b) => a.slot - b.slot).map(toPokemonType);

	return {
		id,
		name,
		searchName: name.toLowerCase(),
		sprite,
		altSprites: altSpritesByDefaultId.get(id),
		flavorText: getFlavorText(species),
		gen: await getGeneration(pokemon),
		height: pokemon.height / 10,
		weight: pokemon.weight / 10,
		type1: types[0],
		type2: types[1]
	};
}

async function main(): Promise<void> {
	const speciesList = await getAllSpecies();

	const species = await limitedConcurrency(
		speciesList,
		WORKERS,
		({ name }) => pokemonApi.getPokemonSpeciesByName(name),
		createProgressBar('Fetching species', speciesList.length)
	);

	const allVarieties = species.flatMap((entry) => entry.varieties);

	const includedVarieties = species.flatMap((entry) =>
		entry.varieties.filter(shouldIncludeVariety).map((variety) => ({ species: entry, variety }))
	);

	const pokemonById = await getPokemonById(allVarieties);
	const altSpritesByDefaultId = getAltSpritesByDefaultId(species, pokemonById);

	const pokemonResults = await limitedConcurrency(
		includedVarieties,
		WORKERS,
		({ species, variety }) => toPokemon(species, variety, pokemonById, altSpritesByDefaultId),
		createProgressBar('Building Pokémon', includedVarieties.length)
	);

	const pokemon = pokemonResults.filter((entry): entry is Pokemon => Boolean(entry));

	await mkdir('.generated', { recursive: true });
	await writeFile('.generated/pokemon.json', JSON.stringify(pokemon, null, 2));
}

await main();
