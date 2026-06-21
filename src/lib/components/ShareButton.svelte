<script lang="ts">
	import { Share2, ClipboardCheck, Clipboard } from '@lucide/svelte';

	type Props = {
		text: string;
		title?: string;
		buttonClass?: string | string[];
	};

	let { text, title = 'PkmnGuessr', buttonClass = [] }: Props = $props();

	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;

		setTimeout(() => {
			copied = false;
		}, 1500);
	}

	async function share() {
		if (!navigator.share) {
			await copy();
			return;
		}

		await navigator.share({
			title,
			text
		});
	}
</script>

<button type="button" onclick={share} class={buttonClass}>
	<span class="max-[350px]:hidden mr-1">Share</span>
	<Share2 class="inline size-4 shrink-0 sm:size-5" />
</button>

<button type="button" onclick={copy} class={buttonClass}>
	<span class="max-[350px]:hidden mr-1">{copied ? 'Copied' : 'Copy'}</span>

	{#if copied}
		<ClipboardCheck class="inline shrink-0 size-5" />
	{:else}
		<Clipboard class="inline shrink-0 size-5" />
	{/if}
</button>
