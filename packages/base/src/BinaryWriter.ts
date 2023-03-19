import { IDisposable } from './IDisposable';
import { MemoryStream } from './MemoryStream';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/BinaryWriter.cs,cf806b417abe1a35,references
export class BinaryWriter implements IDisposable {
	constructor(protected outStream: MemoryStream) {}

	dispose(): void {
		this.outStream.dispose();
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
}
