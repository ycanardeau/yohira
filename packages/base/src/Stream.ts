import { IDisposable } from './IDisposable';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/Stream.cs,f956b0c07e86df64,references
export abstract class Stream implements IDisposable {
	abstract get canRead(): boolean;
	abstract get canWrite(): boolean;
	abstract get canSeek(): boolean;

	abstract get length(): number;
	abstract get position(): number;
	abstract set position(value: number);

	protected static validateBufferArguments(
		buffer: Buffer,
		offset: number,
		count: number,
	): void {
		if (buffer === undefined) {
			throw new Error('Value cannot be null.' /* LOC */);
		}

		if (offset < 0) {
			throw new Error(/* TODO: message */);
		}

		if (count > buffer.length - offset) {
			throw new Error(/* TODO: message */);
		}
	}

	protected disposeCore(disposing: boolean): void {}

	close(): void {
		this.disposeCore(true);
		// TODO
	}

	dispose(): void {
		this.close();
	}

	abstract read(buffer: Buffer, offset: number, count: number): number;

	readByte(): number {
		const oneByteArray = Buffer.alloc(1);
		const r = this.read(oneByteArray, 0, 1);
		return r == 0 ? -1 : oneByteArray[0];
	}

	abstract flush(): void;

	abstract write(buffer: Buffer, offset: number, count: number): void;

	writeByte(value: number): void {
		this.write(Buffer.from([value]), 0, 1);
	}
}
