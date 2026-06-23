<script lang="ts">
	import type { Pokemon } from '$lib/types/Pokemon';
	import { ArrowUp, ArrowDown, CircleSlash2 } from '@lucide/svelte';
	import { type Guess, Hint } from '$lib/types/Guess';
	import { PUBLIC_ASSETS_DOMAIN } from '$env/static/public';

	type Props = { guess: Guess; pokemon: Pokemon };

	const { guess, pokemon }: Props = $props();
	const { correct, hints } = $derived(guess);
</script>

<div class="grid w-full grid-cols-7 gap-1 max-[450px]:text-xs sm:text-lg">
	<div
		class={[
			'flex aspect-square w-full items-center justify-center rounded-xl border-3 border-gray-200 bg-linear-to-tr from-white sm:border-4',
			correct && 'border-green-600! to-green-100',
			!correct && 'border-red-600 to-red-100'
		]}
	>
		<img
			src="{PUBLIC_ASSETS_DOMAIN}/{pokemon.sprite}"
			alt={pokemon.name}
			class="h-full w-full object-contain"
			loading="lazy"
		/>
	</div>
	<div
		class={[
			'flex aspect-square w-full flex-col items-center justify-center rounded-xl border-3 border-gray-200 bg-linear-to-tr from-white text-center sm:border-4 ',
			hints.gen === Hint.Correct && 'border-green-600! to-green-100',
			hints.gen !== Hint.Correct && 'border-red-600 to-red-100'
		]}
	>
		<span>Gen {pokemon.gen.id}</span>
		{#if hints.gen === Hint.Higher}
			<ArrowUp class="ml-0.5" />
		{:else if hints.gen === Hint.Lower}
			<ArrowDown class="ml-0.5" />
		{/if}
	</div>
	<div
		class={[
			'flex aspect-square w-full items-center justify-center rounded-xl border-3 border-gray-200 bg-linear-to-tr from-white sm:border-4',
			hints.type1 === Hint.Correct && 'border-green-600! to-green-100',
			hints.type1 === Hint.Incorrect && 'border-red-600 to-red-100',
			hints.type1 === Hint.OtherPosition && 'border-orange-400 to-orange-100'
		]}
	>
		<img
			src="{PUBLIC_ASSETS_DOMAIN}/sprites/types/small/{pokemon.type1.id}.png"
			alt={pokemon.type1.name}
			class:grayscale={hints.type1 !== Hint.Correct}
			class="h-1/2 w-1/2 object-contain"
			loading="lazy"
		/>
	</div>
	<div
		class={[
			'flex aspect-square w-full items-center justify-center rounded-xl border-3 border-gray-200 bg-linear-to-tr from-white sm:border-4',
			hints.type2 === Hint.Correct && 'border-green-600! to-green-100',
			hints.type2 === Hint.Incorrect && 'border-red-600 to-red-100',
			hints.type2 === Hint.OtherPosition && 'border-orange-400 to-orange-100'
		]}
	>
		{#if pokemon.type2}
			<img
				src="{PUBLIC_ASSETS_DOMAIN}/sprites/types/small/{pokemon.type2.id}.png"
				alt={pokemon.type2.name}
				class:grayscale={hints.type2 !== Hint.Correct}
				class="h-1/2 w-1/2 object-contain"
				loading="lazy"
			/>
		{:else}
			<span class="text-gray-400">
				<CircleSlash2 class="size-9" />
			</span>
		{/if}
	</div>
	<div
		class={[
			'flex aspect-square w-full flex-col items-center justify-center rounded-xl border-3 border-gray-200 bg-linear-to-tr from-white text-center sm:border-4 ',
			hints.height === Hint.Correct && 'border-green-600! to-green-100',
			hints.height !== Hint.Correct && 'border-red-600 to-red-100'
		]}
	>
		<span>{pokemon.height}</span>
		{#if hints.height === Hint.Higher}
			<ArrowUp class="size-4 sm:size-6" />
		{:else if hints.height === Hint.Lower}
			<ArrowDown class="size-4 sm:size-6" />
		{/if}
	</div>
	<div
		class={[
			'flex aspect-square w-full flex-col items-center justify-center rounded-xl border-3 border-gray-200 bg-linear-to-tr from-white text-center sm:border-4 ',
			hints.weight === Hint.Correct && 'border-green-600! to-green-100',
			hints.weight !== Hint.Correct && 'border-red-600 to-red-100'
		]}
	>
		<span>{pokemon.weight}</span>
		{#if hints.weight === Hint.Higher}
			<ArrowUp class="size-4 sm:size-6" />
		{:else if hints.weight === Hint.Lower}
			<ArrowDown class="size-4 sm:size-6" />
		{/if}
	</div>
	<div
		class={[
			'flex aspect-square w-full items-center justify-center rounded-xl border-3 border-gray-200 bg-linear-to-tr from-white sm:border-4',
			hints.shape === Hint.Correct && 'border-green-600! to-green-100',
			hints.shape === Hint.Incorrect && 'border-red-600 to-red-100'
		]}
	>
		<img
			src="{PUBLIC_ASSETS_DOMAIN}/{pokemon.shape?.sprite}"
			alt={pokemon.shape?.sprite}
			class="h-2/3 w-2/3 object-contain"
			loading="lazy"
		/>
	</div>
</div>
