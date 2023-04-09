// OPTIMIZE
// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Text/StringBuilder.cs,6e631639c1e2746b
export class StringBuilder {
	private value = '';

	get length(): number {
		return this.value.length;
	}
	set length(value: number) {
		// TODO

		const delta = value - this.length;
		if (delta > 0) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			this.value = this.value.substring(0, value);
		}
		if (this.length !== value) {
			throw new Error('Something went wrong setting Length.');
		}
	}

	appendChar(value: number): this {
		this.value += String.fromCharCode(value);
		return this;
	}

	appendChars(
		value: number[] | undefined,
		startIndex: number,
		charCount: number,
	): this {
		if (value === undefined) {
			if (startIndex === 0 && charCount === 0) {
				return this;
			}

			throw new Error('Value cannot be null.' /* LOC */);
		}
		if (charCount > value.length - startIndex) {
			throw new Error(
				'Index was out of range. Must be non-negative and less than or equal to the size of the collection.' /* LOC */,
			);
		}

		if (charCount !== 0) {
			this.value += String.fromCharCode(
				...value.slice(startIndex, startIndex + charCount),
			);
		}

		return this;
	}

	appendString(value: string): void {
		this.value += value;
	}

	toString(): string {
		return this.value;
	}
}
