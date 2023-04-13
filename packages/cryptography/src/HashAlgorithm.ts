import { IDisposable } from '@yohira/base';

import { ICryptoTransform } from './ICryptoTransform';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HashAlgorithm.cs,e7c6be1ed86f474f,references
export abstract class HashAlgorithm implements IDisposable, ICryptoTransform {
	get inputBlockSize(): number {
		return 1;
	}
	get outputBlockSize(): number {
		return 1;
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
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
