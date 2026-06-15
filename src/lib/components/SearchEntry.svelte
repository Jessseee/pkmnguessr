<script lang="ts">
	import type { Pokemon } from '$lib/types/Pokemon';
	import type { HTMLLiAttributes } from 'svelte/elements';
	import { PUBLIC_ASSETS_DOMAIN } from '$env/static/public';

	type Props = { pokemon: Pokemon; showFlavorText?: boolean } & HTMLLiAttributes;

	const { pokemon, showFlavorText = false, ...elementProps }: Props = $props();

	const sprite = $derived.by(() => {
		const sprites = pokemon.altSprites ?? [pokemon.sprite];
		return sprites[Math.floor(Math.random() * sprites.length)];
	});
</script>

<li
	{...elementProps}
	class="grid w-fit grid-cols-[--spacing(28)_--spacing(64)] bg-white {elementProps.class}"
>
	<div class="border-b-2 border-[#f1f1f1] bg-linear-to-tr from-white to-[#daffff]">
		<img
			src="{PUBLIC_ASSETS_DOMAIN}/{sprite}"
			alt={pokemon.name}
			class="size-full object-contain"
			loading="lazy"
		/>
	</div>

	<div class="flex flex-col">
		<div class="bg-slate-900 pl-2 font-semibold text-white">
			{pokemon.name}
		</div>

		<table class="h-full text-sm">
			<tbody class="h-full">
				<tr class="h-1/3">
					<td class="w-22 border-b-2 border-[#d1d1d1] bg-[#dbdbd9] pl-2">Type</td>
					<td class="border-b-2 border-[#f1f1f1] bg-white px-2">
						<div class="flex flex-row items-center gap-x-2">
							<img
								class="w-18 rounded-xs"
								src="{PUBLIC_ASSETS_DOMAIN}/sprites/types/{pokemon.type1.id}.png"
								alt={pokemon.type1.name}
							/>

							{#if pokemon.type2}
								<img
									class="w-18 rounded-xs"
									src="{PUBLIC_ASSETS_DOMAIN}/sprites/types/{pokemon.type2.id}.png"
									alt={pokemon.type2.name}
								/>
							{/if}
						</div>
					</td>
				</tr>

				<tr class="h-1/3">
					<td class="border-b-2 border-[#d1d1d1] bg-[#dbdbd9] pl-2">Height</td>
					<td class="border-b-2 border-[#f1f1f1] bg-white pl-2">{pokemon.height}m</td>
				</tr>

				<tr class="h-1/3">
					<td class="border-b-2 border-[#d1d1d1] bg-[#dbdbd9] pl-2">Weight</td>
					<td class="border-b-2 border-[#f1f1f1] bg-white pl-2">{pokemon.weight}kg</td>
				</tr>

				<tr class="h-1/3">
					<td class="border-b-2 border-[#d1d1d1] bg-[#dbdbd9] pl-2">Generation</td>
					<td class="border-b-2 border-[#f1f1f1] bg-white pl-2">
						{pokemon.gen.name} (Gen {pokemon.gen.id})
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	{#if showFlavorText && pokemon.flavorText}
		<div class="col-span-2 m-1 rounded border-2 border-slate-600 bg-white text-xs">
			<div class="rounded-xs border-x-10 border-red-400">
				<div class="border-2 border-red-300 px-2 py-1">
					{pokemon.flavorText}
				</div>
			</div>
		</div>
	{/if}
</li>
