// OPTIMIZE
export function indexOfAny(searchSpace: string, values: string[]): number {
	for (const value of values) {
		const indexOf = searchSpace.indexOf(value);
		if (indexOf >= 0) {
			return indexOf;
		}
	}

	return -1;
}

// OPTIMIZE
export function indexOfAnyExcept(
	searchSpace: string,
	values: string[],
): number {
	for (let i = 0; i < searchSpace.length; i++) {
		if (values.every((value) => value !== searchSpace[i])) {
			return i;
		}
	}
	return -1;
}

export function includesAnyExcept(
	searchSpace: string,
	values: string[],
): boolean {
	return indexOfAnyExcept(searchSpace, values) >= 0;
}
