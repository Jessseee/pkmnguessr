<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import { onMount } from 'svelte';

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
	] as const;

	type Pokeball = (typeof pokeballs)[number];

	export function getRandomPokeball(): Pokeball {
		const index = Math.floor(Math.random() * pokeballs.length);
		return pokeballs[index]!;
	}

	let props: Omit<HTMLImgAttributes, 'src'> = $props();

	let pokeball = $state<Pokeball | null>(null);

	onMount(() => {
		pokeball = getRandomPokeball();
	});
</script>

{#if pokeball}
	<img {...props} src={`/poke-ball/${pokeball}.png`} alt={pokeball} />
{/if}
