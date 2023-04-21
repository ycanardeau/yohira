import { IDisposable, Stream } from '@yohira/base';

import { CryptoStreamMode } from './CryptoStreamMode';
import { ICryptoTransform } from './ICryptoTransform';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/CryptoStream.cs,af85dc74cc324e3e,references
export class CryptoStream extends Stream implements IDisposable {
	private inputBuffer: Buffer; // read from _stream before _Transform
	private inputBufferIndex = 0;
	private readonly inputBlockSize: number;
	private outputBuffer: Buffer; // buffered output of _Transform
	private outputBufferIndex = 0;
	private readonly outputBlockSize: number;
	private _canRead = false;
	private _canWrite = false;
	private finalBlockTransformed = false;

	constructor(
		private readonly stream: Stream,
		private readonly transform: ICryptoTransform,
		mode: CryptoStreamMode,
		private readonly leaveOpen = false,
	) {
		super();

		switch (mode) {
			case CryptoStreamMode.Read:
				if (!stream.canRead) {
					throw new Error('Stream was not readable.' /* LOC */);
				}
				this._canRead = true;
				break;

			case CryptoStreamMode.Write:
				if (!stream.canWrite) {
					throw new Error('Stream was not writable.' /* LOC */);
				}
				this._canWrite = true;
				break;

			default:
				throw new Error('Value was invalid.' /* LOC */);
		}

		this.inputBlockSize = transform.inputBlockSize;
		this.inputBuffer = Buffer.alloc(this.inputBlockSize);
		this.outputBlockSize = transform.outputBlockSize;
		this.outputBuffer = Buffer.alloc(this.outputBlockSize);
	}

	get canRead(): boolean {
		return this._canRead;
	}

	get canSeek(): boolean {
		return false;
	}

	get canWrite(): boolean {
		return this._canWrite;
	}

	get length(): number {
		throw new Error('Stream does not support seeking.' /* LOC */);
	}

	get position(): number {
		throw new Error('Stream does not support seeking.' /* LOC */);
	}
	set position(value: number) {
		throw new Error('Stream does not support seeking.' /* LOC */);
	}

	private flushFinalBlockCore(useAsync: boolean): void {
		if (this.finalBlockTransformed) {
			throw new Error(
				'flushFinalBlock() method was called twice on a CryptoStream. It can only be called once.' /* LOC */,
			);
		}
		this.finalBlockTransformed = true;

		// Transform and write out the final bytes.
		if (this._canWrite) {
			if (this.outputBufferIndex !== 0) {
				throw new Error(
					'The output index can only ever be non-zero when in read mode.' /* LOC */,
				);
			}

			const finalBytes = this.transform.transformFinalBlock(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.inputBuffer!,
				0,
				this.inputBufferIndex,
			);
			if (useAsync) {
				// TODO
				throw new Error('Method not implemented.');
			} else {
				this.stream.write(finalBytes, 0, finalBytes.length);
			}
		}

		// If the inner stream is a CryptoStream, then we want to call FlushFinalBlock on it too, otherwise just Flush.
		if (this.stream instanceof CryptoStream) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			if (useAsync) {
				// TODO
				throw new Error('Method not implemented.');
			} else {
				this.stream.flush();
			}
		}

		// zeroize plain text material before returning
		if (this.inputBuffer !== undefined) {
			this.inputBuffer.fill(0);
		}
		if (this.outputBuffer !== undefined) {
			this.outputBuffer.fill(0);
		}
	}

	flushFinalBlock(): void {
		return this.flushFinalBlockCore(false);
	}

	flush(): void {
		if (this.canWrite) {
			this.stream.flush();
		}
	}

	private checkWriteArguments(
		buffer: Buffer,
		offset: number,
		count: number,
	): void {
		Stream.validateBufferArguments(buffer, offset, count);
		if (!this.canWrite) {
			throw new Error('Stream does not support writing.' /* LOC */);
		}
	}

	private writeCore(buffer: Buffer, useAsync: boolean): void {
		// write <= count bytes to the output stream, transforming as we go.
		// Basic idea: using bytes in the inputBuffer first, make whole blocks,
		// transform them, and write them out.  Cache any remaining bytes in the inputBuffer.
		const bytesToWrite = buffer.length;
		const currentInputIndex = 0;
		// if we have some bytes in the inputBuffer, we have to deal with those first,
		// so let's try to make an entire block out of it
		if (this.inputBufferIndex > 0) {
			// TODO
			throw new Error('Method not implemented.');
		}

		if (this.outputBufferIndex !== 0) {
			throw new Error(
				'The output index can only ever be non-zero when in read mode.',
			);
		}
		// At this point, either the inputBuffer is full, empty, or we've already returned.
		// If full, let's process it -- we now know the outputBuffer is empty
		let numOutputBytes: number;
		if (this.inputBufferIndex === this.inputBlockSize) {
			if (
				this.inputBuffer === undefined ||
				this.outputBuffer === undefined
			) {
				throw new Error('Assertion failed.');
			}
			numOutputBytes = this.transform.transformBlock(
				this.inputBuffer,
				0,
				this.inputBlockSize,
				this.outputBuffer,
				0,
			);
			// write out the bytes we just got
			if (useAsync) {
				// TODO
				throw new Error('Method not implemented.');
			} else {
				this.stream.write(this.outputBuffer, 0, numOutputBytes);
			}

			// reset the inputBuffer
			this.inputBufferIndex = 0;
		}
		while (bytesToWrite > 0) {
			if (bytesToWrite >= this.inputBlockSize) {
				// TODO
				throw new Error('Method not implemented.');
			} else {
				if (this.inputBuffer === undefined) {
					throw new Error('Assertion failed.');
				}
				// In this case, we don't have an entire block's worth left, so store it up in the
				// input buffer, which by now must be empty.
				buffer
					.subarray(
						currentInputIndex,
						currentInputIndex + bytesToWrite,
					)
					.copy(this.inputBuffer);
				this.inputBufferIndex += bytesToWrite;
				return;
			}
		}
	}

	write(buffer: Buffer, offset: number, count: number): void {
		this.checkWriteArguments(buffer, offset, count);
		this.writeCore(buffer.subarray(offset, count), false);
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
