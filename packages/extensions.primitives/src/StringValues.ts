import { IEquatable } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Primitives/StringValues.cs,f7f329a587dc1a5e,references
export class StringValues implements IEquatable<StringValues> {
	constructor(
		private readonly values: (string | undefined) | (string | undefined)[],
	) {}

	static readonly empty = new StringValues([]);

	static isUndefinedOrEmpty(value: StringValues): boolean {
		const data = value.values;
		if (data === undefined) {
			return true;
		}
		if (typeof data === 'string') {
			// Not array, can only be string
			return !!data;
		} else {
			switch (data.length) {
				case 0:
					return true;
				case 1:
					return !!data[0];
				default:
					return false;
			}
		}
	}

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

	private copyTo(array: (string | undefined)[], arrayIndex: number): void {
		const value = this.values;
		if (typeof value === 'string') {
			if (arrayIndex < 0) {
				throw new Error(
					'Specified argument was out of the range of valid values.' /* LOC */,
				);
			}
			if (array.length - arrayIndex < 1) {
				throw new Error(
					"'array' is not long enough to copy all the items in the collection. Check 'arrayIndex' and 'array' length.",
				);
			}

			array[arrayIndex] = value;
			return;
		}

		if (value !== undefined) {
			for (let i = 0; i < value.length; i++) {
				array[arrayIndex + i] = value[0 + i];
			}
		}
	}

	static concat(values1: StringValues, values2: StringValues): StringValues {
		const count1 = values1.count;
		const count2 = values2.count;

		if (count1 === 0) {
			return values2;
		}

		if (count2 === 0) {
			return values1;
		}

		const combined: string[] = new Array(count1 + count2);
		values1.copyTo(combined, 0);
		values2.copyTo(combined, count1);
		return new StringValues(combined);
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

	private getArrayValue(): (string | undefined)[] | undefined {
		const value = this.values;
		if (typeof value === 'string') {
			return [value];
		} else if (value !== undefined) {
			return value;
		} else {
			return undefined;
		}
	}

	toArray(): (string | undefined)[] {
		return this.getArrayValue() ?? [];
	}
}
