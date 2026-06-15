<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Pokémon Guessr</title>
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<img
	class="absolute right-0 bottom-0 -z-10 sm:w-4/5 lg:w-1/2 xl:w-1/3"
	src="/pokeball.svg"
	alt=""
/>
{@render children()}
