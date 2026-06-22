<script lang="ts">
	import { PUBLIC_SITE_DOMAIN } from '$env/static/public';

	type Props = {
		title: string;
		description: string;
		path?: string;
		image?: string;
		type?: 'website' | 'article' | string;
		siteName?: string;
	};

	let {
		title,
		description,
		path = '/',
		image = '/social-preview-600x315.png',
		type = 'website',
		siteName = 'PkmnGuessr'
	}: Props = $props();

	const absoluteUrl = (value: string) => new URL(value, PUBLIC_SITE_DOMAIN).toString();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={absoluteUrl(path)} />

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={absoluteUrl(path)} />
	<meta property="og:image" content={absoluteUrl(image)} />
	<meta property="og:site_name" content={siteName} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={absoluteUrl(image)} />
</svelte:head>
