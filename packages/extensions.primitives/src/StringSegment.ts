import { getHashCode } from '@yohira/base';

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

	private indexOfCore(c: string, start: number, count: number): number {
		let index = -1;

		if (this.hasValue) {
			if (start > this.length) {
				throw new Error(
					'Specified argument was out of the range of valid values.' /* LOC */,
				);
			}

			if (count > this.length - start) {
				throw new Error(
					'Specified argument was out of the range of valid values.' /* LOC */,
				);
			}

			index = this.substring(start, count).indexOf(c);
			if (index !== -1) {
				index -= this.offset;
			}
		}

		return index;
	}

	indexOf(c: string): number;
	indexOf(c: string, start: number): number;
	indexOf(c: string, start?: number, count?: number): number {
		if (start !== undefined && count !== undefined) {
			return this.indexOfCore(c, start, count);
		} else if (start !== undefined) {
			return this.indexOfCore(c, start, this.length - start);
		} else {
			return this.indexOfCore(c, 0, this.length);
		}
	}

	toString(): string {
		return this.value ?? '';
	}

	getHashCode(): number {
		return getHashCode(this.toString());
	}

	toLowerCase(): StringSegment {
		return StringSegment.from(this.value?.toLowerCase());
	}
}
