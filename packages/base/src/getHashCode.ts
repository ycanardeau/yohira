function getBooleanHashCode(value: boolean): number {
	return value ? 1 : 0;
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/7616484#7616484
function getStringHashCode(value: string): number {
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

export function getHashCode(value: boolean | string): number {
	switch (typeof value) {
		case 'boolean':
			return getBooleanHashCode(value);

		case 'string':
			return getStringHashCode(value);
	}
}
