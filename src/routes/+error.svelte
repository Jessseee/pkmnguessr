<script lang="ts">
	import { page } from '$app/state';
	import { Undo2, RefreshCw } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	const title =
		page.status === 404
			? 'Page not found'
			: page.status === 500
				? 'Server error'
				: 'Something went wrong';

	const message =
		page.error?.message || 'The page could not be loaded. Try going back or returning home.';
</script>

<svelte:head>
	<title>PkmnGuessr - {page.status}</title>
</svelte:head>

<div
	class="relative z-10 flex min-h-[calc(100svh-5rem)] items-center justify-center px-6 py-12"
>
	<div
		class="w-full max-w-xl rounded-2xl border-2 border-slate-200 drop-shadow-2xl p-8 text-center bg-white"
		in:fly={{ y: 16, duration: 350 }}
	>
		<div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-400/90 shadow-inner">
			<img
				src="/poke-ball/poke-ball.png"
				alt="Poké Ball"
				class="h-20 w-20 grayscale transition duration-300 hover:grayscale-0"
			/>
		</div>

		<p class="mb-2 text-sm font-black uppercase tracking-[0.35em] text-red-500">
			Error {page.status}
		</p>

		<h1 class="mb-3 text-4xl font-black text-slate-800 sm:text-5xl">
			{title}
		</h1>

		{#if page.status !== 404}
			<p class="mx-auto mb-8 max-w-sm text-base font-semibold leading-7 text-slate-600">
				{message}
			</p>
		{/if}

		<div class="flex flex-col justify-center mt-8 gap-3 sm:flex-row">
			{#if page.status === 404}
				<button
					type="button"
					onclick={() => history.back() }
					class={[
						'flex min-w-0 items-center justify-center rounded-xl border-4 border-orange-500 bg-orange-100 px-2 py-1.5 font-bold text-orange-700 transition-colors sm:px-4',
						'hover:cursor-pointer hover:border-red-600 hover:bg-red-100 hover:text-red-700'
					]}
				>
					Go back <Undo2 class="ml-1 size-5"/>
				</button>
			{:else}
				<button
					type="button"
					onclick={() => location.reload() }
					class={[
						'flex min-w-0 items-center justify-center rounded-xl border-4 border-orange-500 bg-orange-100 px-2 py-1.5 font-bold text-orange-700 transition-colors sm:px-4',
						'hover:cursor-pointer hover:border-red-600 hover:bg-red-100 hover:text-red-700'
					]}
				>
					Try again <RefreshCw class="mt-0.5 ml-1 size-5"/>
				</button>
			{/if}
		</div>
	</div>
</div>