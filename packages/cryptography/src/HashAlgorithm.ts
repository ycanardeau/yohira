import { IDisposable } from '@yohira/base';

import { ICryptoTransform } from './ICryptoTransform';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HashAlgorithm.cs,e7c6be1ed86f474f,references
export abstract class HashAlgorithm implements IDisposable, ICryptoTransform {
	private disposed = false;
	protected hashSizeValue = 0;
	protected hashValue?: Buffer;
	protected state = 0;

	get hashSize(): number {
		return this.hashSizeValue;
	}

	get hash(): Buffer | undefined {
		if (this.disposed) {
			throw new Error('Cannot access a disposed object.' /* LOC */);
		}
		if (this.state !== 0) {
			throw new Error(
				'Hash must be finalized before the hash value is retrieved.' /* LOC */,
			);
		}

		return this.hashValue !== undefined
			? Buffer.from(this.hashValue)
			: undefined;
	}

	// We assume any HashAlgorithm can take input a byte at a time
	get inputBlockSize(): number {
		return 1;
	}
	get outputBlockSize(): number {
		return 1;
	}

	protected abstract hashCore(
		buffer: Buffer,
		ibStart: number,
		cbSize: number,
	): void;
	protected abstract hashFinal(): Buffer;
	abstract initialize(): void;

	private captureHashCodeAndReinitialize(): Buffer {
		this.hashValue = this.hashFinal();

		// Clone the hash value prior to invoking initialize in case the user-defined initialize
		// manipulates the array.
		const tmp = Buffer.from(this.hashValue);
		this.initialize();
		return tmp;
	}

	computeHash(buffer: Buffer): Buffer;
	computeHash(buffer: Buffer, offset: number, count: number): Buffer;
	computeHash(buffer: Buffer, offset?: number, count?: number): Buffer {
		if (offset !== undefined && count !== undefined) {
			if (buffer === undefined) {
				throw new Error('Value cannot be null.' /* LOC */);
			}

			if (offset < 0) {
				throw new Error(
					`offset ('${offset}') must be a non-negative value.` /* LOC */,
				);
			}
			if (count < 0 || count > buffer.length) {
				throw new Error('Value was invalid.' /* LOC */);
			}
			if (buffer.length - count < offset) {
				throw new Error(
					'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.' /* LOC */,
				);
			}

			if (this.disposed) {
				throw new Error('Cannot access a disposed object.' /* LOC */);
			}

			this.hashCore(buffer, offset, count);
			return this.captureHashCodeAndReinitialize();
		} else {
			if (this.disposed) {
				throw new Error('Cannot access a disposed object.' /* LOC */);
			}
			if (buffer === undefined) {
				throw new Error('Value cannot be null.' /* LOC */);
			}

			this.hashCore(buffer, 0, buffer.length);
			return this.captureHashCodeAndReinitialize();
		}
	}

	dispose(): void {
		this.disposed = true;
	}

	private validateTransformBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
	): void {
		if (inputBuffer === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}

		if (inputOffset < 0) {
			throw new Error(
				`inputOffset ('${inputOffset}') must be a non-negative value.` /* LOC */,
			);
		}
		if (inputCount < 0 || inputCount > inputBuffer.length) {
			throw new Error('Value was invalid.' /* LOC */);
		}
		if (inputBuffer.length - inputCount < inputOffset) {
			throw new Error(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.' /* LOC */,
			);
		}

		if (this.disposed) {
			throw new Error('Cannot access a disposed object.' /* LOC */);
		}
	}

	transformBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
		outputBuffer: Buffer,
		outputOffset: number,
	): number {
		this.validateTransformBlock(inputBuffer, inputOffset, inputCount);

		// Change the State value
		this.state = 1;

		this.hashCore(inputBuffer, inputOffset, inputCount);
		if (
			outputBuffer !== undefined &&
			(inputBuffer !== outputBuffer || inputOffset !== outputOffset)
		) {
			// We let BlockCopy do the destination array validation
			throw new Error('Method not implemented.');
		}
		return inputCount;
	}

	transformFinalBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
	): Buffer {
		this.validateTransformBlock(inputBuffer, inputOffset, inputCount);

		this.hashCore(inputBuffer, inputOffset, inputCount);
		this.hashValue = this.captureHashCodeAndReinitialize();
		let outputBytes: Buffer;
		if (inputCount !== 0) {
			outputBytes = Buffer.alloc(inputCount);
			throw new Error('Method not implemented.');
		} else {
			outputBytes = Buffer.alloc(0);
		}

		// Reset the State value
		this.state = 0;

		return outputBytes;
	}
}
