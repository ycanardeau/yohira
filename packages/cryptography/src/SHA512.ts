import { Err, Ok, Result } from '@yohira/third-party.ts-results';

import { HashAlgorithm } from './HashAlgorithm';
import { HashAlgorithmNames } from './HashAlgorithmNames';
import { HashProvider } from './HashProvider';
import {
	OneShotHashProvider,
	createHashProvider,
} from './HashProviderDispenser';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/SHA512.cs,f9600b0d781d55e8,references
export abstract class SHA512 extends HashAlgorithm {
	/**
	 * The hash size produced by the SHA512 algorithm, in bits.
	 */
	static readonly hashSizeInBits = 512;

	/**
	 * The hash size produced by the SHA512 algorithm, in bytes.
	 */
	static readonly hashSizeInBytes = SHA512.hashSizeInBits / 8;

	protected constructor() {
		super();

		this.hashSizeValue = SHA512.hashSizeInBits;
	}

	static create(): SHA512 {
		return new Impl();
	}

	static tryHashData(
		source: Buffer,
		destination: Buffer,
	): Result<number, number> {
		if (destination.length < SHA512.hashSizeInBytes) {
			return new Err(0);
		}

		const bytesWritten = OneShotHashProvider.hashData(
			HashAlgorithmNames.SHA512,
			source,
			destination,
		);
		if (bytesWritten !== SHA512.hashSizeInBytes) {
			throw new Error('Assertion failed');
		}

		return new Ok(bytesWritten);
	}

	static hashDataCore(source: Buffer, destination: Buffer): number {
		const tryHashDataResult = SHA512.tryHashData(source, destination);
		if (!tryHashDataResult.ok) {
			throw new Error('Destination is too short.' /* LOC */);
		}

		return tryHashDataResult.val;
	}

	static hashData(source: Buffer): Buffer {
		const buffer = Buffer.alloc(SHA512.hashSizeInBytes);

		const written = SHA512.hashDataCore(source, buffer);
		if (written !== buffer.length) {
			throw new Error('Assertion failed.');
		}

		return buffer;
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/SHA512.cs,5ff684f06a138967,references
class Impl extends SHA512 {
	private readonly hashProvider: HashProvider;

	constructor() {
		super();

		this.hashProvider = createHashProvider(HashAlgorithmNames.SHA512);
		this.hashSizeValue = this.hashProvider.hashSizeInBytes * 8;
	}

	protected hashCore(buffer: Buffer, ibStart: number, cbSize: number): void {
		return this.hashProvider.appendHashData(buffer, ibStart, cbSize);
	}

	protected hashFinal(): Buffer {
		return this.hashProvider.finalizeHashAndReset();
	}

	initialize(): void {
		this.hashProvider.reset();
	}

	[Symbol.dispose](): void {
		this.hashProvider[Symbol.dispose]();
		super[Symbol.dispose]();
	}
}
