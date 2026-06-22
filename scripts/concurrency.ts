export async function limitedConcurrency<T, R>(
	items: readonly T[],
	workers: number,
	fn: (item: T, index: number) => Promise<R>,
	onProgress?: (completed: number, total: number) => void
): Promise<R[]> {
	const results = new Array<R>(items.length);
	const workerCount = Math.min(Math.max(workers, 1), items.length);

	let index = 0;
	let completed = 0;

	async function worker(): Promise<void> {
		while (index < items.length) {
			const currentIndex = index;
			index += 1;

			results[currentIndex] = await fn(items[currentIndex], currentIndex);

			completed += 1;
			onProgress?.(completed, items.length);
		}
	}

	await Promise.all(Array.from({ length: workerCount }, worker));

	return results;
}

export function createProgressBar(
	label: string,
	total: number,
	width: number = 30
): (completed: number) => void {
	let lastLineLength = 0;

	function render(completed: number): void {
		const ratio = total === 0 ? 1 : completed / total;
		const filled = Math.round(ratio * width);
		const empty = width - filled;
		const percent = Math.round(ratio * 100)
			.toString()
			.padStart(3, ' ');

		const line = `${label} [${'='.repeat(filled)}${' '.repeat(empty)}] ${percent}% ${completed}/${total}`;

		if (!process.stdout.isTTY) {
			if (completed === total) {
				process.stdout.write(`${line}\n`);
			}

			return;
		}

		process.stdout.write(`\r${line}${' '.repeat(Math.max(0, lastLineLength - line.length))}`);
		lastLineLength = line.length;

		if (completed === total) {
			process.stdout.write('\n');
		}
	}

	render(0);

	return render;
}
