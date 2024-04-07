import { randomUUID } from 'node:crypto';

import { IEquatable } from './IEquatable';

export class Guid implements IEquatable<Guid> {
	constructor(
		readonly a: number,
		readonly b: number,
		readonly c: number,
		readonly d: number,
		readonly e: number,
		readonly f: number,
		readonly g: number,
		readonly h: number,
		readonly i: number,
		readonly j: number,
		readonly k: number,
	) {
		if (a < -2147483648 || a > 2147483647) {
			throw new Error(/* TODO: message */);
		}
		if (b < -32768 || b > 32767) {
			throw new Error(/* TODO: message */);
		}
		if (c < -32768 || c > 32767) {
			throw new Error(/* TODO: message */);
		}
		if (d < 0 || d > 255) {
			throw new Error(/* TODO: message */);
		}
		if (e < 0 || e > 255) {
			throw new Error(/* TODO: message */);
		}
		if (f < 0 || f > 255) {
			throw new Error(/* TODO: message */);
		}
		if (g < 0 || g > 255) {
			throw new Error(/* TODO: message */);
		}
		if (h < 0 || h > 255) {
			throw new Error(/* TODO: message */);
		}
		if (i < 0 || i > 255) {
			throw new Error(/* TODO: message */);
		}
		if (j < 0 || j > 255) {
			throw new Error(/* TODO: message */);
		}
		if (k < 0 || k > 255) {
			throw new Error(/* TODO: message */);
		}
	}

	static fromBuffer(value: Buffer): Guid {
		if (value.length !== 16) {
			throw new Error(/* TODO: message */);
		}

		return new Guid(
			value.readInt32LE(0),
			value.readInt16LE(4),
			value.readInt16LE(6),
			value.readUint8(8),
			value.readUint8(9),
			value.readUint8(10),
			value.readUint8(11),
			value.readUint8(12),
			value.readUint8(13),
			value.readUint8(14),
			value.readUint8(15),
		);
	}

	static fromString(value: string): Guid {
		const parts = value.split('-');
		if (parts.length !== 5) {
			throw new Error(/* TODO: message */);
		}

		if (parts[0].length !== 8) {
			throw new Error(/* TODO: message */);
		}
		const a = ((): number => {
			const buffer = Buffer.from(parts[0], 'hex');
			return buffer.readInt32BE();
		})();

		if (parts[1].length !== 4) {
			throw new Error(/* TODO: message */);
		}
		const b = ((): number => {
			const buffer = Buffer.from(parts[1], 'hex');
			return buffer.readInt16BE();
		})();

		if (parts[2].length !== 4) {
			throw new Error(/* TODO: message */);
		}
		const c = ((): number => {
			const buffer = Buffer.from(parts[2], 'hex');
			return buffer.readInt16BE();
		})();

		if (parts[3].length !== 4) {
			throw new Error(/* TODO: message */);
		}
		const [d, e] = ((): [number, number] => {
			const buffer = Buffer.from(parts[3], 'hex');
			return [buffer.readUint8(0), buffer.readUint8(1)];
		})();

		if (parts[4].length !== 12) {
			throw new Error(/* TODO: message */);
		}
		const [f, g, h, i, j, k] = ((): [
			number,
			number,
			number,
			number,
			number,
			number,
		] => {
			const buffer = Buffer.from(parts[4], 'hex');
			return [
				buffer.readUint8(0),
				buffer.readUint8(1),
				buffer.readUint8(2),
				buffer.readUint8(3),
				buffer.readUint8(4),
				buffer.readUint8(5),
			];
		})();

		return new Guid(a, b, c, d, e, f, g, h, i, j, k);
	}

	static empty(): Guid {
		return new Guid(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
	}

	static newGuid(): Guid {
		return Guid.fromString(randomUUID());
	}

	static equals(left: Guid, right: Guid): boolean {
		return (
			left.a === right.a &&
			left.b === right.b &&
			left.c === right.c &&
			left.d === right.d &&
			left.e === right.e &&
			left.f === right.f &&
			left.g === right.g &&
			left.h === right.h &&
			left.i === right.i &&
			left.j === right.j &&
			left.k === right.k
		);
	}

	equals(other: Guid): boolean {
		return Guid.equals(this, other);
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(16);
		buffer.writeInt32LE(this.a, 0);
		buffer.writeInt16LE(this.b, 4);
		buffer.writeInt16LE(this.c, 6);
		buffer.writeUint8(this.d, 8);
		buffer.writeUint8(this.e, 9);
		buffer.writeUint8(this.f, 10);
		buffer.writeUint8(this.g, 11);
		buffer.writeUint8(this.h, 12);
		buffer.writeUint8(this.i, 13);
		buffer.writeUint8(this.j, 14);
		buffer.writeUint8(this.k, 15);
		return buffer;
	}

	toString(): string {
		const parts: string[] = [];
		parts.push(
			((): string => {
				const buffer = Buffer.alloc(4);
				buffer.writeInt32BE(this.a);
				return buffer.toString('hex');
			})(),
		);
		parts.push(
			((): string => {
				const buffer = Buffer.alloc(2);
				buffer.writeInt16BE(this.b);
				return buffer.toString('hex');
			})(),
		);
		parts.push(
			((): string => {
				const buffer = Buffer.alloc(2);
				buffer.writeInt16BE(this.c);
				return buffer.toString('hex');
			})(),
		);
		parts.push(
			((): string => {
				const buffer = Buffer.alloc(2);
				buffer.writeUint8(this.d, 0);
				buffer.writeUint8(this.e, 1);
				return buffer.toString('hex');
			})(),
		);
		parts.push(
			((): string => {
				const buffer = Buffer.alloc(6);
				buffer.writeUint8(this.f, 0);
				buffer.writeUint8(this.g, 1);
				buffer.writeUint8(this.h, 2);
				buffer.writeUint8(this.i, 3);
				buffer.writeUint8(this.j, 4);
				buffer.writeUint8(this.k, 5);
				return buffer.toString('hex');
			})(),
		);
		return parts.join('-');
	}
}
