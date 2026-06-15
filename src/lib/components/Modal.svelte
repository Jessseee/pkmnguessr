<script lang="ts">
	import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { X } from '@lucide/svelte';

	type Props = {
		open?: boolean;
		modalProps?: HTMLAttributes<HTMLDivElement>;
		button: Snippet<[HTMLButtonAttributes]>;
		modal: Snippet;
	};

	let { open = $bindable(false), modalProps, button, modal }: Props = $props();

	const buttonProps: HTMLButtonAttributes = {
		onclick: openModal,
		type: 'button',
		class: 'hover:cursor-pointer'
	};

	function openModal() {
		open = true;
		history.pushState({ modalOpen: true }, '', window.location.href);
	}

	function closeModal() {
		open = false;

		if (history.state?.modalOpen) {
			history.back();
		}
	}

	onMount(() => {
		function handlePopState() {
			if (open) {
				open = false;
			}
		}

		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	});
</script>

{@render button(buttonProps)}

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 grid place-items-center p-2 sm:p-4" onclick={closeModal}>
		<div
			{...modalProps}
			onclick={(event) => event.stopPropagation()}
			class="relative box-border w-[calc(100svw-1rem)] max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white py-4 pr-3 pl-6 shadow-sm {modalProps?.class}"
		>
			<button
				type="button"
				class="absolute top-2 right-2 text-slate-600 hover:cursor-pointer hover:text-slate-950"
				onclick={closeModal}
			>
				<X />
			</button>

			<div class="mt-4 max-h-[85svh] overflow-y-auto pt-1 pr-2">
				{@render modal()}
			</div>
		</div>
	</div>
{/if}
