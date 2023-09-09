// https://source.dot.net/#Microsoft.Extensions.Primitives/StringSegment.cs,43c0264cae2a2363,references
export class StringSegment /* TODO: implements IEquatable<StringSegment> */ {
	private constructor(
		readonly buffer: string | undefined,
		readonly offset: number,
		readonly length: number,
	) {}

	static from(buffer: string | undefined): StringSegment {
		return new StringSegment(buffer, 0, buffer?.length ?? 0);
	}

	static fromSegment(
		buffer: string | undefined,
		offset: number,
		length: number,
	): StringSegment {
		if (
			buffer === undefined ||
			offset > buffer.length ||
			length > buffer.length - offset
		) {
			throw new Error(/* TODO: message */);
		}

		return new StringSegment(buffer, offset, length);
	}

	static readonly empty = StringSegment.from('');

	static isNullOrEmpty(value: StringSegment): boolean {
		if (value.buffer === undefined || value.length === 0) {
			return true;
		}

		return false;
	}

	get value(): string | undefined {
		return this.buffer !== undefined
			? this.buffer.substring(this.offset, this.offset + this.length)
			: undefined;
	}

	get hasValue(): boolean {
		return this.buffer !== undefined;
	}

	equals(other: StringSegment): boolean {
		if (this.hasValue && other.hasValue) {
			return this.value === other.value;
		} else {
			// TODO
			return !this.hasValue && !other.hasValue;
		}
	}

	at(index: number): string {
		if (index < 0 || index >= this.length) {
			throw new Error(
				'Specified argument was out of the range of valid values.' /* LOC */,
			);
		}

		if (this.buffer === undefined) {
			throw new Error('Assertion failed.');
		}
		return this.buffer[this.offset + index];
	}

	substring(offset: number, length = this.length - offset): string {
		if (
			this.buffer === undefined ||
			offset < 0 ||
			length < 0 ||
			offset + length > this.length
		) {
			throw new Error(/* TODO: message */);
		}

		return this.buffer.substring(
			this.offset + offset,
			this.offset + offset + length,
		);
	}

	subsegment(offset: number, length = this.length - offset): StringSegment {
		if (
			this.buffer === undefined ||
			offset < 0 ||
			length < 0 ||
			offset + length > this.length
		) {
			throw new Error(/* TODO: message */);
		}

		return StringSegment.fromSegment(
			this.buffer,
			this.offset + offset,
			length,
		);
	}

	toString(): string {
		return this.value ?? '';
	}
}
