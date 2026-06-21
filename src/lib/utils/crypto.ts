export function hashString(value: string): number {
	let hash = 2166136261;

	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}

	return hash >>> 0;
}

export function seededRandom(seed: number): number {
	seed += 0x6d2b79f5;

	let value = seed;
	value = Math.imul(value ^ (value >>> 15), value | 1);
	value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

	return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}
