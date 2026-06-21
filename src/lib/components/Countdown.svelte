<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import type { HTMLAttributes } from 'svelte/elements';

	let props: HTMLAttributes<HTMLSpanElement> = $props();

	let timeLeft = $state('00:00:00');

	function getTimeUntilUtcMidnight(): string {
		const now = new Date();

		const nextMidnight = new SvelteDate(now);
		nextMidnight.setUTCHours(24, 0, 0, 0);

		let totalSeconds = Math.floor((nextMidnight.getTime() - now.getTime()) / 1000);

		totalSeconds %= 24 * 60 * 60;

		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
	}

	onMount(() => {
		timeLeft = getTimeUntilUtcMidnight();

		const interval = window.setInterval(() => {
			timeLeft = getTimeUntilUtcMidnight();
		}, 1000);

		return () => {
			window.clearInterval(interval);
		};
	});
</script>

<span {...props}>{timeLeft}</span>
