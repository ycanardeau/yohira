import { IDisposable } from '@yohira/base';

import { ICryptoTransform } from './ICryptoTransform';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HashAlgorithm.cs,e7c6be1ed86f474f,references
export abstract class HashAlgorithm implements IDisposable, ICryptoTransform {
	private disposed = false;
	protected hashSizeValue = 0;
	protected hashValue?: Buffer;

	get hashSize(): number {
		return this.hashSizeValue;
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

	computeHash(buffer: Buffer): Buffer {
		this.hashCore(buffer, 0, buffer.length);
		return this.captureHashCodeAndReinitialize();
	}

	dispose(): void {
		this.disposed = true;
	}

	transformBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
		outputBuffer: Buffer,
		outputOffset: number,
	): number {
		// TODO
		throw new Error('Method not implemented.');
	}

	transformFinalBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
	): Buffer {
		// TODO
		throw new Error('Method not implemented.');
	}
}
