<script lang="ts" generics="T">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props<T> = {
		searchResults: T[];
		data: T[];
		callback: () => void;
		filter: (item: T, value: string) => boolean;
		minLength?: number;
		maxResults?: number;
	} & HTMLInputAttributes;

	let {
		value = $bindable(''),
		searchResults = $bindable([]), // eslint-disable-line no-useless-assignment
		callback,
		data,
		filter,
		minLength = 3,
		maxResults = 20,
		...attributes
	}: Props<T> = $props();

	$effect(() => {
		callback();
		const query = value.toLowerCase().trim();
		searchResults =
			query.length < minLength
				? []
				: data.reduce<T[]>((results, item) => {
						if (results.length >= maxResults) return results;
						if (filter(item, query)) return [...results, item];
						return results;
					}, []);
	});
</script>

<input bind:value type="text" name="guess" {...attributes} />
