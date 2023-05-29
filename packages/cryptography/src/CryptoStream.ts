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

	get hasFlushedFinalBlock(): boolean {
		return this.finalBlockTransformed;
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
		if (this._canWrite) {
			this.stream.flush();
		}
	}

	private checkReadArguments(
		buffer: Buffer,
		offset: number,
		count: number,
	): void {
		Stream.validateBufferArguments(buffer, offset, count);
		if (!this.canRead) {
			throw new Error('Stream does not support reading.' /* LOC */);
		}
	}

	readByte(): number {
		// If we have enough bytes in the buffer such that reading 1 will still leave bytes
		// in the buffer, then take the faster path of simply returning the first byte.
		// (This unfortunately still involves shifting down the bytes in the buffer, as it
		// does in Read.  If/when that's fixed for Read, it should be fixed here, too.)
		if (this.outputBufferIndex > 1) {
			if (this.outputBuffer === undefined) {
				throw new Error('Assertion failed.');
			}
			const b = this.outputBuffer[0];
			this.outputBuffer.copy(
				this.outputBuffer,
				0,
				1,
				this.outputBufferIndex,
			);
			this.outputBufferIndex -= 1;
			return b;
		}

		// Otherwise, fall back to the more robust but expensive path of using the base
		// Stream.readByte to call Read.
		return super.readByte();
	}

	private readCore(buffer: Buffer): number {
		while (true) {
			// If there are currently any bytes stored in the output buffer, hand back as many as we can.
			if (this.outputBufferIndex !== 0) {
				const bytesToCopy = Math.min(
					this.outputBufferIndex,
					buffer.length,
				);
				if (bytesToCopy !== 0) {
					// Copy as many bytes as we can, then shift down the remaining bytes.
					this.outputBuffer.subarray(0, bytesToCopy).copy(buffer);
					this.outputBufferIndex -= bytesToCopy;
					this.outputBuffer
						.subarray(bytesToCopy)
						.copy(this.outputBuffer);
					this.outputBuffer
						.subarray(
							this.outputBufferIndex,
							this.outputBufferIndex + bytesToCopy,
						)
						.fill(0);
				}
				return bytesToCopy;
			}

			// If we've already hit the end of the stream, there's nothing more to do.
			if (this.outputBufferIndex !== 0) {
				throw new Error('Assertion failed.');
			}
			if (this.finalBlockTransformed) {
				if (this.inputBufferIndex !== 0) {
					throw new Error('Assertion failed.');
				}
				return 0;
			}

			let bytesRead = 0;
			let eof = false;

			// If the transform supports transforming multiple blocks, try to read as large a chunk as would yield
			// data to fill the output buffer and do the appropriate transform directly into the output buffer.
			const blocksToProcess = Math.floor(
				buffer.length / this.outputBlockSize,
			);
			if (
				blocksToProcess > 1 &&
				this.transform.canTransformMultipleBlocks
			) {
				// REVIEW
				// Use ArrayPool.Shared instead of CryptoPool because the array is passed out.
				const numWholeBlocksInBytes =
					blocksToProcess * this.inputBlockSize;
				let tempInputBuffer: Buffer | undefined = Buffer.alloc(
					numWholeBlocksInBytes,
				);
				try {
					// Read into our temporary input buffer, leaving enough room at the beginning for any existing data
					// we have in _inputBuffer.
					bytesRead = this.stream.read(
						tempInputBuffer,
						this.inputBufferIndex,
						numWholeBlocksInBytes - this.inputBufferIndex,
					);
					eof = bytesRead === 0;

					// If we got enough data to form at least one block, transform as much as we can.
					const totalInput = this.inputBufferIndex + bytesRead;
					if (totalInput >= this.inputBlockSize) {
						// Copy any held data into tempInputBuffer now that we know we're proceeding to handle
						// decrypting all the received data.
						this.inputBuffer.copy(
							tempInputBuffer,
							0,
							0,
							this.inputBufferIndex,
						);
						this.inputBuffer.fill(0, 0, this.inputBufferIndex);
						bytesRead += this.inputBufferIndex;

						// Determine how many entire blocks worth of data we read.
						const numWholeReadBlocks = Math.floor(
							bytesRead / this.inputBlockSize,
						);
						const numWholeReadBlocksInBytes =
							numWholeReadBlocks * this.inputBlockSize;

						// If there's anything left over, copy that back into _inputBuffer for a later read.
						this.inputBufferIndex =
							bytesRead - numWholeReadBlocksInBytes;
						if (this.inputBufferIndex !== 0) {
							tempInputBuffer.copy(
								this.inputBuffer,
								0,
								numWholeReadBlocksInBytes,
								numWholeReadBlocksInBytes +
									this.inputBufferIndex,
							);
						}

						// Transform the read data into the caller's buffer.
						let numOutputBytes: number;
						if (false) {
							// TODO
							throw new Error('Method not implemented.');
						} else {
							// Otherwise, we need to rent a temporary from the pool.
							let tempOutputBuffer: Buffer | undefined =
								Buffer.alloc(
									numWholeReadBlocks * this.outputBlockSize,
								);
							numOutputBytes =
								numWholeReadBlocks * this.outputBlockSize;
							try {
								numOutputBytes = this.transform.transformBlock(
									tempInputBuffer,
									0,
									numWholeReadBlocksInBytes,
									tempOutputBuffer,
									0,
								);
								tempOutputBuffer
									.subarray(0, numOutputBytes)
									.copy(buffer);
							} finally {
								tempOutputBuffer.fill(0, 0, numOutputBytes);
								tempOutputBuffer = undefined;
							}
						}

						// Return anything we've got at this point.
						if (numOutputBytes !== 0) {
							return numOutputBytes;
						}
					} else {
						// We have less than a block's worth of data.  Copy the new data back into the _inputBuffer
						// and fall back to using the single block code path.
						tempInputBuffer.copy(
							this.inputBuffer,
							this.inputBufferIndex,
							this.inputBufferIndex,
							this.inputBufferIndex + bytesRead,
						);
						this.inputBufferIndex = totalInput;
					}
				} finally {
					tempInputBuffer.fill(0, 0, numWholeBlocksInBytes);
					tempInputBuffer = undefined;
				}
			}

			// Read enough to fill one input block, as anything less won't be able to be transformed to produce output.
			if (!eof) {
				while (this.inputBufferIndex < this.inputBlockSize) {
					bytesRead = this.stream.read(
						this.inputBuffer,
						this.inputBufferIndex,
						this.inputBlockSize - this.inputBufferIndex,
					);
					if (bytesRead <= 0) {
						break;
					}

					this.inputBufferIndex += bytesRead;
				}
			}

			// Transform the received data.
			if (bytesRead <= 0) {
				this.outputBuffer = this.transform.transformFinalBlock(
					this.inputBuffer,
					0,
					this.inputBufferIndex,
				);
				this.outputBufferIndex = this.outputBuffer.length;
				this.finalBlockTransformed = true;
			} else {
				this.outputBufferIndex = this.transform.transformBlock(
					this.inputBuffer,
					0,
					this.inputBufferIndex,
					this.outputBuffer,
					0,
				);
			}

			// All input data has been processed.
			this.inputBufferIndex = 0;
		}
	}

	read(buffer: Buffer, offset: number, count: number): number {
		this.checkReadArguments(buffer, offset, count);
		return this.readCore(buffer.subarray(offset, offset + count));
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

	private static transformBlock(
		transform: ICryptoTransform,
		inputBuffer: Buffer,
		outputBuffer: Buffer,
		outputOffset: number,
	): number {
		if (false /* TODO */) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			// Use ArrayPool.Shared instead of CryptoPool because the array is passed out.
			let rentedBuffer: Buffer | undefined = Buffer.alloc(
				inputBuffer.length,
			);
			let result: number;
			try {
				inputBuffer.copy(rentedBuffer);
				result = transform.transformBlock(
					rentedBuffer,
					0,
					inputBuffer.length,
					outputBuffer,
					outputOffset,
				);
			} finally {
				rentedBuffer.subarray(0, inputBuffer.length).fill(0);
			}

			rentedBuffer = undefined;
			return result;
		}
	}

	private writeCore(buffer: Buffer, useAsync: boolean): void {
		// write <= count bytes to the output stream, transforming as we go.
		// Basic idea: using bytes in the inputBuffer first, make whole blocks,
		// transform them, and write them out.  Cache any remaining bytes in the inputBuffer.
		let bytesToWrite = buffer.length;
		let currentInputIndex = 0;
		// if we have some bytes in the inputBuffer, we have to deal with those first,
		// so let's try to make an entire block out of it
		if (this.inputBufferIndex > 0) {
			if (this.inputBuffer === undefined) {
				throw new Error('Assertion failed.');
			}
			if (buffer.length >= this.inputBlockSize - this.inputBufferIndex) {
				// we have enough to transform at least a block, so fill the input block
				buffer
					.subarray(0, this.inputBlockSize - this.inputBufferIndex)
					.copy(this.inputBuffer.subarray(this.inputBufferIndex));
				currentInputIndex +=
					this.inputBlockSize - this.inputBufferIndex;
				bytesToWrite -= this.inputBlockSize - this.inputBufferIndex;
				this.inputBufferIndex = this.inputBlockSize;
				// Transform the block and write it out
			} else {
				// not enough to transform a block, so just copy the bytes into the inputBuffer
				// and return
				buffer.copy(this.inputBuffer.subarray(this.inputBufferIndex));
				this.inputBufferIndex += buffer.length;
				return;
			}
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
				// We have at least an entire block's worth to transform
				const numWholeBlocks = Math.floor(
					bytesToWrite / this.inputBlockSize,
				);

				// If the transform will handle multiple blocks at once, do that
				if (
					this.transform.canTransformMultipleBlocks &&
					numWholeBlocks > 1
				) {
					const numWholeBlocksInBytes =
						numWholeBlocks * this.inputBlockSize;

					// REVIEW
					// Use ArrayPool.Shared instead of CryptoPool because the array is passed out.
					let tempOutputBuffer: Buffer | undefined = Buffer.alloc(
						numWholeBlocks * this.outputBlockSize,
					);
					numOutputBytes = 0;

					try {
						numOutputBytes = CryptoStream.transformBlock(
							this.transform,
							buffer.subarray(
								currentInputIndex,
								currentInputIndex + numWholeBlocksInBytes,
							),
							tempOutputBuffer,
							0,
						);

						// TODO
						this.stream.write(tempOutputBuffer, 0, numOutputBytes);

						currentInputIndex += numWholeBlocksInBytes;
						bytesToWrite -= numWholeBlocksInBytes;
						tempOutputBuffer.fill(0, 0, numOutputBytes);
						// TODO
					} catch (error) {
						tempOutputBuffer.fill(0, 0, numOutputBytes);
						throw error;
					} finally {
						// REVIEW
						tempOutputBuffer = undefined;
					}
				} else {
					if (this.outputBuffer === undefined) {
						throw new Error('Assertion failed.');
					}
					// do it the slow way
					numOutputBytes = CryptoStream.transformBlock(
						this.transform,
						buffer.subarray(
							currentInputIndex,
							currentInputIndex + this.inputBlockSize,
						),
						this.outputBuffer,
						0,
					);

					this.stream.write(this.outputBuffer, 0, numOutputBytes);

					currentInputIndex += this.inputBlockSize;
					bytesToWrite -= this.inputBlockSize;
				}
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
		this.writeCore(buffer.subarray(offset, offset + count), false);
	}

	clear(): void {
		this.close();
	}

	protected disposeCore(disposing: boolean): void {
		try {
			if (disposing) {
				if (!this.finalBlockTransformed) {
					this.flushFinalBlock();
				}
				if (!this.leaveOpen) {
					this.stream.dispose();
				}
			}
		} finally {
			try {
				// Ensure we don't try to transform the final block again if we get disposed twice
				// since it's null after this
				this.finalBlockTransformed = true;
				// we need to clear all the internal buffers
				if (this.inputBuffer !== undefined) {
					this.inputBuffer.fill(0);
				}
				if (this.outputBuffer !== undefined) {
					this.outputBuffer.fill(0);
				}

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.inputBuffer = undefined!;
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.outputBuffer = undefined!;
				this._canRead = false;
				this._canWrite = false;
			} finally {
				super.disposeCore(disposing);
			}
		}
	}
}
