import { MemoryStream } from './MemoryStream';
import { SeekOrigin } from './SeekOrigin';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/BinaryWriter.cs,cf806b417abe1a35,references
export class BinaryWriter implements Disposable {
	constructor(protected outStream: MemoryStream) {}

	[Symbol.dispose](): void {
		this.outStream[Symbol.dispose]();
	}

	seek(offset: number, loc: SeekOrigin): number {
		return this.outStream.seek(offset, loc);
	}

	flush(): void {
		this.outStream.flush();
	}

	writeBoolean(value: boolean): void {
		const buffer = Buffer.alloc(1);
		buffer.writeUint8(value ? 1 : 0);
		this.outStream.write(buffer, 0, buffer.length);
	}

	writeUint8(value: number): void {
		const buffer = Buffer.alloc(1);
		buffer.writeUint8(value);
		this.outStream.write(buffer, 0, buffer.length);
	}

	writeInt16LE(value: number): void {
		const buffer = Buffer.alloc(2);
		buffer.writeInt16LE(value);
		this.outStream.write(buffer, 0, buffer.length);
	}

	writeInt32LE(value: number): void {
		const buffer = Buffer.alloc(4);
		buffer.writeInt32LE(value);
		this.outStream.write(buffer, 0, buffer.length);
	}

	write7BitEncodedInt(value: number): void {
		let uValue = new Uint32Array([value])[0];

		while (uValue > 0x7f) {
			this.writeUint8(new Uint8Array([uValue | ~0x7f])[0]);
			uValue = uValue >>> 7;
		}

		this.writeUint8(uValue);
	}

	writeUint16LE(value: number): void {
		const buffer = Buffer.alloc(2);
		buffer.writeUint16LE(value);
		this.outStream.write(buffer, 0, buffer.length);
	}

	writeUint32LE(value: number): void {
		const buffer = Buffer.alloc(4);
		buffer.writeUint32LE(value);
		this.outStream.write(buffer, 0, buffer.length);
	}

	writeUint32BE(value: number): void {
		const buffer = Buffer.alloc(4);
		buffer.writeUint32BE(value);
		this.outStream.write(buffer, 0, buffer.length);
	}

	// Writes a length-prefixed string to this stream in the BinaryWriter's
	// current Encoding. This method first writes the length of the string as
	// an encoded unsigned integer with variable length, and then writes that many characters
	// to the stream.
	//
	writeString(value: string): void {
		if (value === undefined) {
			throw new Error('Value cannot be null.' /* LOC */);
		}

		// TODO

		const buffer = Buffer.from(value /* TODO: encoding */);
		const actualBytecount = buffer.length;
		this.write7BitEncodedInt(actualBytecount);
		// TODO
		this.outStream.write(buffer, 0, buffer.length);
	}
}
