import { IEquatable } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Primitives/StringValues.cs,f7f329a587dc1a5e,references
export class StringValues implements IEquatable<StringValues> {
	constructor(
		private readonly values: (string | undefined) | (string | undefined)[],
	) {}

	static readonly empty = new StringValues([]);

	get count(): number {
		const value = this.values;
		if (value === undefined) {
			return 0;
		}
		if (typeof value === 'string') {
			return 1;
		} else {
			// Not string, not undefined, can only be string[]
			return value.length;
		}
	}

	at(index: number): string | undefined {
		const value = this.values;
		if (typeof value === 'string') {
			if (index === 0) {
				return value;
			}
		} else if (value !== undefined) {
			// Not string, not undefined, can only be string[]
			return value[index];
		}

		throw new Error('Index was outside the bounds of the array.' /* LOC */);
	}

	static equals(left: StringValues, right: StringValues): boolean {
		const count = left.count;

		if (count !== right.count) {
			return false;
		}

		for (let i = 0; i < count; i++) {
			if (left.at(i) !== right.at(i)) {
				return false;
			}
		}

		return true;
	}

	equals(other: StringValues): boolean {
		return StringValues.equals(this, other);
	}
}
