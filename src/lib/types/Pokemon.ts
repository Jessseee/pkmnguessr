export type Type = {
	id: string;
	name: string;
};

export type Generation = {
	id: number;
	name: string;
};

export type Pokemon = {
	id: string;
	name: string;
	searchName: string;
	gen: Generation;
	sprite: string;
	altSprites?: string[];
	flavorText?: string;
	weight: number;
	height: number;
	type1: Type;
	type2?: Type;
};
