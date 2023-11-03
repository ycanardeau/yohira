import { MemoryStream } from './MemoryStream';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/BinaryReader.cs,4f6cad84482876ff,references
export class BinaryReader implements Disposable {
	constructor(private readonly _stream: MemoryStream) {}

	[Symbol.dispose](): void {
		this._stream[Symbol.dispose]();
	}

	readBoolean(): boolean {
		const buffer = Buffer.alloc(1);
		this._stream.read(buffer, 0, buffer.length);
		return buffer.readUint8() !== 0;
	}

	readUint8(): number {
		const buffer = Buffer.alloc(1);
		this._stream.read(buffer, 0, buffer.length);
		return buffer.readUint8();
	}

	readInt16LE(): number {
		const buffer = Buffer.alloc(2);
		this._stream.read(buffer, 0, buffer.length);
		return buffer.readInt16LE();
	}

	readInt32LE(): number {
		const buffer = Buffer.alloc(4);
		this._stream.read(buffer, 0, buffer.length);
		return buffer.readInt32LE();
	}

	read7BitEncodedInt(): number {
		let result = 0;
		let byteReadJustNow: number;

		const MaxBytesWithoutOverflow = 4;
		for (let shift = 0; shift < MaxBytesWithoutOverflow * 7; shift += 7) {
			// ReadByte handles end of stream cases for us.
			byteReadJustNow = this.readUint8();
			result |= (byteReadJustNow & 0x7f) << shift;

			if (byteReadJustNow <= 0x7f) {
				return result; // early exit
			}
		}

		byteReadJustNow = this.readUint8();
		if (byteReadJustNow > 15) {
			throw new Error(
				'Too many bytes in what should have been a 7-bit encoded integer.' /* LOC */,
			);
		}

		result |= byteReadJustNow << (MaxBytesWithoutOverflow * 7);
		return result;
	}

	readUint16LE(): number {
		const buffer = Buffer.alloc(2);
		this._stream.read(buffer, 0, buffer.length);
		return buffer.readUint16LE();
	}

	readUint32LE(): number {
		const buffer = Buffer.alloc(4);
		this._stream.read(buffer, 0, buffer.length);
		return buffer.readUint32LE();
	}

	readString(): string {
		const stringLength = this.read7BitEncodedInt();
		// TODO

		// TODO

		// TODO
		const buffer = Buffer.alloc(stringLength);
		this._stream.read(buffer, 0, buffer.length);
		return buffer.toString(/* TODO: encoding */);
	}
}
