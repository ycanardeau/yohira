import {
	StringBuilder,
	escapeDataString,
	indexOfAnyExcept,
	isHexEncoding,
} from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/PathString.cs,ff3b073b1591ea45,references
/**
 * Provides correct escaping for Path and PathBase values when needed to reconstruct a request or redirect URI string
 */
export class PathString {
	private static readonly validPathChars =
		"!$&'()*+,-./0123456789:;=@ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~".split(
			'',
		);

	readonly value: string | undefined;

	constructor(value?: string) {
		if (!!value && value[0] !== '/') {
			throw new Error("The path in 'value' must start with '/'.");
		}
		this.value = value;
	}

	static readonly empty = new PathString('');

	get hasValue(): boolean {
		return !!this.value;
	}

	private static toEscapedUriComponent(value: string, i: number): string {
		let buffer: StringBuilder | undefined = undefined;

		let start = 0;
		let count = i;
		let requiresEscaping = false;

		while (i < value.length) {
			let isPercentEncodedChar = false;
			if (
				PathString.validPathChars.includes(value[i]) ||
				(isPercentEncodedChar = isHexEncoding(value, i))
			) {
				if (requiresEscaping) {
					// the current segment requires escape
					buffer ??= new StringBuilder(/* TODO: value.length * 3 */);
					buffer.appendString(
						escapeDataString(value.substring(start, start + count)),
					);

					requiresEscaping = false;
					start = i;
					count = 0;
				}

				if (isPercentEncodedChar) {
					count += 3;
					i += 3;
				} else {
					// We just saw a character we don't want to escape. It's likely there are more, do a vectorized search.
					const charsToSkip = indexOfAnyExcept(
						value.substring(i),
						PathString.validPathChars,
					);

					if (charsToSkip < 0) {
						// Only valid characters remain
						count += value.length - 1;
						break;
					}

					count += charsToSkip;
					i += charsToSkip;
				}
			} else {
				if (!requiresEscaping) {
					// the current segment doesn't require escape
					buffer ??= new StringBuilder(/* TODO: value.length * 3 */);
					buffer.appendString(value.substring(start, start + count));

					requiresEscaping = true;
					start = i;
					count = 0;
				}

				count++;
				i++;
			}
		}

		if (count === value.length && !requiresEscaping) {
			return value;
		} else {
			if (count <= 0) {
				throw new Error('Assertion failed.');
			}
			if (buffer === undefined) {
				throw new Error('Method not implemented.');
			}

			if (requiresEscaping) {
				buffer.appendString(
					escapeDataString(value.substring(start, start + count)),
				);
			} else {
				buffer.appendString(value.substring(start, start + count));
			}

			return buffer.toString();
		}
	}

	/**
	 * Provides the path string escaped in a way which is correct for combining into the URI representation.
	 * @returns The escaped path value
	 */
	toUriComponent(): string {
		const value = this.value;

		if (!value) {
			return '';
		}

		const indexOfInvalidChar = indexOfAnyExcept(
			value,
			PathString.validPathChars,
		);

		return indexOfInvalidChar < 0
			? value
			: PathString.toEscapedUriComponent(value, indexOfInvalidChar);
	}

	toString(): string {
		return this.toUriComponent();
	}

	// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/PathString.cs,1626aafd12e724a9,references
	/**
	 * Determines whether the beginning of this {@link PathString} instance matches the specified {@link PathString} when compared
	 * using the specified comparison option and returns the remaining segments.
	 * @param other The {@link PathString} to compare.
	 * @returns true if value matches the beginning of this string; otherwise, false.
	 */
	startsWithSegments(other: PathString): {
		ret: boolean;
		remaining: PathString;
	} {
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
	}

	equals(other: PathString): boolean {
		if (!this.hasValue && other.hasValue) {
			return true;
		}

		return this.value === other.value;
	}
}
