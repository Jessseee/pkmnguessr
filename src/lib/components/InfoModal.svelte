<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { BookOpenText } from '@lucide/svelte';
</script>

<Modal>
	{#snippet button(buttonProps)}
		<button
			{...buttonProps}
			class={[
				'rounded-xl border-4 border-slate-400 bg-white px-1 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-100 hover:text-slate-700',
				buttonProps?.class
			]}
		>
			<BookOpenText />
		</button>
	{/snippet}
	{#snippet modal()}
		<div class="space-y-2">
			<p class="text-sm font-medium tracking-wide text-blue-600 uppercase">Search help</p>

			<h2 id="filter-help-title" class="text-2xl font-bold tracking-tight text-slate-950">
				Filter Pokémon results
			</h2>

			<p class="max-w-2xl text-sm leading-6 text-slate-600">
				Find Pokémon directly with auto-complete (type at least 3 characters) or add filters using
				the syntax below.
			</p>
		</div>

		<div class="mt-6 rounded-xl bg-slate-100 p-4">
			<p class="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Syntax</p>

			<code
				class="block rounded-lg bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200"
			>
				filter=value
			</code>

			<p class="mt-3 text-sm text-slate-600">
				<span class="rounded bg-red-100 px-1.5 py-0.5 text-red-700">Attention!</span>
				Use <code class="rounded bg-slate-200 px-1 py-0.5">gen=1</code>, not
				<code class="rounded bg-slate-200 px-1 py-0.5">gen = 1</code>.
			</p>
		</div>

		<div class="mt-8 flex max-w-full flex-col gap-6 overflow-x-auto">
			<div class="rounded-xl border border-slate-200 p-5">
				<h3 class="text-lg font-semibold text-slate-950">Numeric filters</h3>

				<p class="mt-1 text-sm text-slate-600">Use these filters with number comparisons.</p>

				<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">
					<table class="w-full divide-y divide-slate-200 text-sm">
						<thead class="bg-slate-50">
							<tr>
								<th class="px-4 py-3 text-left font-semibold text-slate-700">Filter</th>
								<th class="px-4 py-3 text-left font-semibold text-slate-700">Description</th>
								<th class="px-4 py-3 text-left font-semibold text-slate-700">Example</th>
							</tr>
						</thead>

						<tbody class="divide-y divide-slate-200">
							<tr>
								<td class="px-4 py-3 align-top">
									<code class="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">id</code>
								</td>
								<td class="px-4 py-3 text-slate-600">Pokémon ID number</td>
								<td class="px-4 py-3">
									<code class="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">id=25</code>
								</td>
							</tr>

							<tr>
								<td class="px-4 py-3 align-top">
									<code class="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">gen</code>
									<span class="mx-1 text-slate-400">or</span>
									<code class="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">generation</code>
								</td>
								<td class="px-4 py-3 text-slate-600">Generation number</td>
								<td class="px-4 py-3">
									<code class="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">gen=1</code>
								</td>
							</tr>

							<tr>
								<td class="px-4 py-3 align-top">
									<code class="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">height</code>
								</td>
								<td class="px-4 py-3 text-slate-600">Pokémon height</td>
								<td class="px-4 py-3">
									<code class="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700"> height&gt;10 </code>
								</td>
							</tr>

							<tr>
								<td class="px-4 py-3 align-top">
									<code class="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">weight</code>
								</td>
								<td class="px-4 py-3 text-slate-600">Pokémon weight</td>
								<td class="px-4 py-3">
									<code class="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
										weight&lt;100
									</code>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="mt-4 flex flex-wrap justify-center gap-2">
					<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
						<code>=</code> equals
					</span>
					<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
						<code>&lt;</code> less than
					</span>
					<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
						<code>&lt;=</code> less than or equal to
					</span>
					<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
						<code>&gt;</code> greater than
					</span>
					<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
						<code>&gt;=</code> greater than or equal to
					</span>
				</div>
			</div>

			<div class="rounded-xl border border-slate-200 p-5">
				<h3 class="text-lg font-semibold text-slate-950">Type filters</h3>

				<p class="mt-1 text-sm text-slate-600">Use these filters to search by Pokémon type.</p>

				<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">
					<table class="w-full divide-y divide-slate-200 text-sm">
						<thead class="bg-slate-50">
							<tr>
								<th class="px-4 py-3 text-left font-semibold text-slate-700">Filter</th>
								<th class="px-4 py-3 text-left font-semibold text-slate-700">Description</th>
								<th class="px-4 py-3 text-left font-semibold text-slate-700">Example</th>
							</tr>
						</thead>

						<tbody class="divide-y divide-slate-200">
							<tr>
								<td class="px-4 py-3 align-top">
									<code class="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">type</code>
								</td>
								<td class="px-4 py-3 text-slate-600">
									Matches either the primary or secondary type
								</td>
								<td class="px-4 py-3">
									<code class="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700"> type=fire </code>
								</td>
							</tr>

							<tr>
								<td class="px-4 py-3 align-top">
									<code class="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">type1</code>
								</td>
								<td class="px-4 py-3 text-slate-600">Matches the primary type</td>
								<td class="px-4 py-3">
									<code class="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700"> type1=grass </code>
								</td>
							</tr>

							<tr>
								<td class="px-4 py-3 align-top">
									<code class="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">type2</code>
								</td>
								<td class="px-4 py-3 text-slate-600">Matches the secondary type</td>
								<td class="px-4 py-3">
									<code class="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700"> type2=flying </code>
								</td>
							</tr>

							<tr>
								<td class="px-4 py-3 align-top">
									<code class="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">type2</code>
								</td>
								<td class="px-4 py-3 text-slate-600"> Matches Pokémon with no secondary type </td>
								<td class="px-4 py-3">
									<code class="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700"> type2=none </code>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="mt-4 flex flex-wrap justify-center gap-2">
					<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
						<code>=</code> matches the type
					</span>
					<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
						<code>!=</code> does not match the type
					</span>
				</div>
			</div>
		</div>

		<div class="mt-8 rounded-xl border border-slate-200 p-5">
			<h3 class="text-lg font-semibold text-slate-950">Examples</h3>

			<div class="mt-4 grid gap-3">
				<div class="rounded-lg bg-slate-50 p-4">
					<code class="text-sm font-semibold text-blue-700">pikachu gen=1</code>
					<p class="mt-1 text-sm text-slate-600">Searches for “pikachu” in generation 1</p>
				</div>

				<div class="rounded-lg bg-slate-50 p-4">
					<code class="text-sm font-semibold text-blue-700">type=water weight&lt;50</code>
					<p class="mt-1 text-sm text-slate-600">Finds Water-type Pokémon under 50kg</p>
				</div>

				<div class="rounded-lg bg-slate-50 p-4">
					<code class="text-sm font-semibold text-blue-700">generation&gt;=3 type!=fire</code>
					<p class="mt-1 text-sm text-slate-600">
						Finds Pokémon from generation 3 and later that are not Fire-type
					</p>
				</div>

				<div class="rounded-lg bg-slate-50 p-4">
					<code class="text-sm font-semibold text-blue-700">type1=normal type2=none</code>
					<p class="mt-1 text-sm text-slate-600">Finds single-type Normal Pokémon</p>
				</div>

				<div class="rounded-lg bg-slate-50 p-4">
					<code class="text-sm font-semibold text-blue-700">height&gt;10 weight&gt;100</code>
					<p class="mt-1 text-sm text-slate-600">Finds large and heavy Pokémon</p>
				</div>
			</div>
		</div>

		<div class="m-1 mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
			<strong class="font-semibold">Notes:</strong>
			Filters are case-insensitive. Invalid filters are treated as normal search text.
		</div>
	{/snippet}
</Modal>
