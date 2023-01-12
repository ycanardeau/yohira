export function indexOfIgnoreCase(
	value: string,
	searchString: string,
	position?: number,
): number {
	return value.toLowerCase().indexOf(searchString.toLowerCase(), position);
}

export function lastIndexOfIgnoreCase(
	value: string,
	searchString: string,
	position?: number,
): number {
	return value
		.toLowerCase()
		.lastIndexOf(searchString.toLowerCase(), position);
}

export function startsWithIgnoreCase(
	value: string,
	searchString: string,
	position?: number,
): boolean {
	return value.toLowerCase().startsWith(searchString.toLowerCase(), position);
}
