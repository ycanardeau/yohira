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

	protected getCopyBufferSize(): number {
		// This value was originally picked to be the largest multiple of 4096 that is still smaller than the large object heap threshold (85K).
		// The CopyTo{Async} buffer is short-lived and is likely to be collected at Gen0, and it offers a significant improvement in Copy
		// performance.  Since then, the base implementations of CopyTo{Async} have been updated to use ArrayPool, which will end up rounding
		// this size up to the next power of two (131,072), which will by default be on the large object heap.  However, most of the time
		// the buffer should be pooled, the LOH threshold is now configurable and thus may be different than 85K, and there are measurable
		// benefits to using the larger buffer size.  So, for now, this value remains.
		const defaultCopyBufferSize = 81920;

		let bufferSize = defaultCopyBufferSize;

		if (this.canSeek) {
			const length = this.length;
			const position = this.position;
			if (length <= position) {
				// Handles negative overflows
				// There are no bytes left in the stream to copy.
				// However, because CopyTo{Async} is virtual, we need to
				// ensure that any override is still invoked to provide its
				// own validation, so we use the smallest legal buffer size here.
				bufferSize = 1;
			} else {
				const remaining = length - position;
				if (remaining > 0) {
					// In the case of a positive overflow, stick to the default size
					bufferSize = Math.min(bufferSize, remaining);
				}
			}
		}

		return bufferSize;
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
