import { mkdir, writeFile } from 'node:fs/promises';
import Pokedex from 'pokedex-promise-v2';
import type { Pokemon, Type } from '../src/lib/types/Pokemon';
import { createProgressBar, limitedConcurrency } from './concurrency';

const pokemonApi = new Pokedex({ timeout: 60_000 });

const WORKERS = 2;
const BATCH_SIZE = 50;
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

function toTitleCase(value: string): string {
	return value
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function toArray<T>(value: T | T[]): T[] {
	return Array.isArray(value) ? value : [value];
}

function toBatches<T>(items: readonly T[], batchSize: number): T[][] {
	const batches: T[][] = [];

	for (let index = 0; index < items.length; index += batchSize) {
		batches.push(items.slice(index, index + batchSize));
	}

	return batches;
}

async function fetchBatched<T, R>(
	label: string,
	items: readonly T[],
	fn: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
	const progress = createProgressBar(label, items.length);
	const batches = toBatches(items, BATCH_SIZE);
	let completed = 0;

	const results = await limitedConcurrency(
		batches,
		Math.min(WORKERS, batches.length),
		async (batch) => {
			const batchResults = await fn(batch);

			completed += batch.length;
			progress(completed);

			return batchResults;
		}
	);

	return results.flat();
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

function getSprite(pokemon?: Pokedex.Pokemon): string | undefined {
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

function shouldIncludeVariety(variety: Pokedex.Variety): boolean {
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

async function getAllSpecies(): Promise<Pokedex.NamedAPIResource[]> {
	const firstPage = (await pokemonApi.getPokemonSpeciesList({
		offset: 0,
		limit: 1
	})) as Pokedex.NamedAPIResourceList;

	const allSpecies = (await pokemonApi.getPokemonSpeciesList({
		offset: 0,
		limit: firstPage.count
	})) as Pokedex.NamedAPIResourceList;

	return allSpecies.results;
}

function getPrimaryFormId(pokemon: Pokedex.Pokemon): string {
	const formUrl = pokemon.forms[0]?.url;

	if (!formUrl) {
		throw new Error(`No forms found for Pokémon: ${pokemon.name}`);
	}

	return getIdFromUrl(formUrl);
}

function toPokemonType(entry: Pokedex.Pokemon['types'][number]): Type {
	const id = getIdFromUrl(entry.type.url);

	return {
		id,
		name: entry.type.name
	};
}

function uniqueVarieties(varieties: Pokedex.Variety[]): Pokedex.Variety[] {
	const seen = new Set<string>();

	return varieties.filter((variety) => {
		const id = getIdFromUrl(variety.pokemon.url);

		if (seen.has(id)) return false;

		seen.add(id);
		return true;
	});
}

async function getPokemonById(varieties: Pokedex.Variety[]): Promise<Map<string, Pokedex.Pokemon>> {
	const ids = uniqueVarieties(varieties).map((variety) =>
		Number(getIdFromUrl(variety.pokemon.url))
	);

	const pokemon = await fetchBatched('Fetching Pokémon', ids, async (batch) => {
		const result = (await pokemonApi.getPokemonByName(batch)) as
			| Pokedex.Pokemon
			| Pokedex.Pokemon[];

		return toArray(result);
	});

	return new Map(pokemon.map((entry) => [String(entry.id), entry]));
}

async function getGenerationByPokemonId(
	pokemonById: Map<string, Pokedex.Pokemon>
): Promise<Map<string, { id: number; name: string }>> {
	const formIds = [
		...new Set([...pokemonById.values()].map((pokemon) => Number(getPrimaryFormId(pokemon))))
	];

	const forms = await fetchBatched('Fetching forms', formIds, async (batch) => {
		const result = (await pokemonApi.getPokemonFormByName(batch)) as
			| Pokedex.PokemonForm
			| Pokedex.PokemonForm[];

		return toArray(result);
	});

	const formById = new Map(forms.map((form) => [String(form.id), form]));
	const versionGroupNames = [...new Set(forms.map((form) => form.version_group.name))];

	const versionGroups = await fetchBatched(
		'Fetching version groups',
		versionGroupNames,
		async (batch) => {
			const result = (await pokemonApi.getVersionGroupByName(batch)) as
				| Pokedex.VersionGroup
				| Pokedex.VersionGroup[];

			return toArray(result);
		}
	);

	const versionGroupByName = new Map(versionGroups.map((entry) => [entry.name, entry]));
	const generationByPokemonId = new Map<string, { id: number; name: string }>();

	for (const [pokemonId, pokemon] of pokemonById) {
		const form = formById.get(getPrimaryFormId(pokemon));

		if (!form) {
			throw new Error(`No form found for Pokémon: ${pokemon.name}`);
		}

		const versionGroup = versionGroupByName.get(form.version_group.name);

		if (!versionGroup) {
			throw new Error(`No version group found for form: ${form.name}`);
		}

		generationByPokemonId.set(pokemonId, {
			id: Number(getIdFromUrl(versionGroup.generation.url)),
			name: formatGamePair(versionGroup.versions.map((version) => version.name))
		});
	}

	return generationByPokemonId;
}

function getAltSpritesByDefaultId(
	species: Pokedex.PokemonSpecies[],
	pokemonById: Map<string, Pokedex.Pokemon>
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

function getFlavorText(species: Pokedex.PokemonSpecies): string | undefined {
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

function toPokemon(
	species: Pokedex.PokemonSpecies,
	variety: Pokedex.Variety,
	pokemonById: Map<string, Pokedex.Pokemon>,
	altSpritesByDefaultId: Map<string, string[]>,
	generationByPokemonId: Map<string, { id: number; name: string }>
): Pokemon | undefined {
	const id = getIdFromUrl(variety.pokemon.url);
	const pokemon = pokemonById.get(id);
	const sprite = getSprite(pokemon);
	const gen = generationByPokemonId.get(id);

	if (!pokemon || !sprite || !gen) return undefined;

	const name = toDisplayPokemonName(variety.pokemon.name);
	const types = [...pokemon.types].sort((a, b) => a.slot - b.slot).map(toPokemonType);

	return {
		id,
		name,
		searchName: name.toLowerCase(),
		sprite,
		altSprites: altSpritesByDefaultId.get(id),
		flavorText: getFlavorText(species),
		gen,
		height: pokemon.height / 10,
		weight: pokemon.weight / 10,
		type1: types[0],
		type2: types[1]
	};
}

async function main(): Promise<void> {
	const speciesList = await getAllSpecies();

	const species = await fetchBatched('Fetching species', speciesList, async (batch) => {
		const result = (await pokemonApi.getPokemonSpeciesByName(batch.map(({ name }) => name))) as
			| Pokedex.PokemonSpecies
			| Pokedex.PokemonSpecies[];

		return toArray(result);
	});

	const allVarieties = species.flatMap((entry) => entry.varieties);

	const includedVarieties = species.flatMap((entry) =>
		entry.varieties.filter(shouldIncludeVariety).map((variety) => ({ species: entry, variety }))
	);

	const pokemonById = await getPokemonById(allVarieties);
	const generationByPokemonId = await getGenerationByPokemonId(pokemonById);
	const altSpritesByDefaultId = getAltSpritesByDefaultId(species, pokemonById);

	const buildProgress = createProgressBar('Building Pokémon', includedVarieties.length);

	const pokemon = includedVarieties
		.map(({ species, variety }, index) => {
			buildProgress(index + 1);

			return toPokemon(species, variety, pokemonById, altSpritesByDefaultId, generationByPokemonId);
		})
		.filter((entry): entry is Pokemon => Boolean(entry));

	await mkdir('.generated', { recursive: true });
	await writeFile('.generated/pokemon.json', JSON.stringify(pokemon, null, 2));
}

await main();
