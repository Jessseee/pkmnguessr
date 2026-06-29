export function dateKey(dateTime = new Date()) {
	return [
		dateTime.getUTCFullYear(),
		String(dateTime.getUTCMonth() + 1).padStart(2, '0'),
		String(dateTime.getUTCDate()).padStart(2, '0')
	].join('-');
}

export function yesterday(): Date {
	const date = new Date();
	date.setDate(date.getDate() - 1);
	return date;
}
