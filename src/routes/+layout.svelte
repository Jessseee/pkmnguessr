<script lang="ts">
	import './layout.css';
	import Menu from '$lib/components/Menu.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>PkmnGuessr</title>
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<img
	class="fixed right-0 bottom-0 -z-10 sm:w-2/3 lg:w-1/2 xl:w-1/3"
	fetchpriority="high"
	src="/pokeball.svg"
	alt=""
/>
<Menu />
{@render children()}
