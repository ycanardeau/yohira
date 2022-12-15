// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/PathString.cs,ff3b073b1591ea45,references
export class PathString {
	readonly value: string | undefined;

	constructor(value: string | undefined) {
		if (!!value && value[0] !== '/') {
			throw new Error("The path in 'value' must start with '/'.");
		}
		this.value = value;
	}

	static readonly empty = new PathString('');

	toString = (): string => {
		return this.value ?? '' /* TODO */;
	};

	// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/PathString.cs,1626aafd12e724a9,references
	/**
	 * Determines whether the beginning of this {@link PathString} instance matches the specified {@link PathString} when compared
	 * using the specified comparison option and returns the remaining segments.
	 * @param other The {@link PathString} to compare.
	 * @returns true if value matches the beginning of this string; otherwise, false.
	 */
	startsWithSegments = (
		other: PathString,
	): { ret: boolean; remaining: PathString } => {
		const value1 = this.value ?? '';
		const value2 = other.value ?? '';
		if (value1.startsWith(value2)) {
			return {
				ret:
					value1.length === value2.length ||
					value1[value2.length] === '/',
				remaining: new PathString(value1.slice(value2.length)),
			};
		}
		return { ret: false, remaining: PathString.empty };
	};
}
