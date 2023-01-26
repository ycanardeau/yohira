// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/7616484#7616484
export function getStringHashCode(value: string): number {
	let hashCode = 0;
	if (value.length === 0) {
		return hashCode;
	}
	for (let i = 0; i < value.length; i++) {
		const char = value.charCodeAt(i);
		hashCode = (hashCode << 5) - hashCode + char;
		hashCode = hashCode | 0;
	}
	return hashCode;
}

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

export function replaceAll(
	value: string,
	searchValue: string | RegExp,
	replaceValue: string,
): string {
	return value.replace(new RegExp(searchValue, 'g'), () => replaceValue);
}

export function startsWithIgnoreCase(
	value: string,
	searchString: string,
	position?: number,
): boolean {
	return value.toLowerCase().startsWith(searchString.toLowerCase(), position);
}
