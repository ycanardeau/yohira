import { Err, Ok, Result } from '@yohira/third-party.ts-results';

import { HashAlgorithm } from './HashAlgorithm';
import { HashAlgorithmNames } from './HashAlgorithmNames';
import { HashProvider } from './HashProvider';
import {
	OneShotHashProvider,
	createHashProvider,
} from './HashProviderDispenser';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/SHA256.cs,b87ea7e64312d482,references
export abstract class SHA256 extends HashAlgorithm {
	/**
	 * The hash size produced by the SHA256 algorithm, in bits.
	 */
	static readonly hashSizeInBits = 256;

	/**
	 * The hash size produced by the SHA256 algorithm, in bytes.
	 */
	static readonly hashSizeInBytes = SHA256.hashSizeInBits / 8;

	protected constructor() {
		super();

		this.hashSizeValue = SHA256.hashSizeInBits;
	}

	static create(): SHA256 {
		return new Impl();
	}

	static tryHashData(
		source: Buffer,
		destination: Buffer,
	): Result<number, number> {
		if (destination.length < SHA256.hashSizeInBytes) {
			return new Err(0);
		}

		const bytesWritten = OneShotHashProvider.hashData(
			HashAlgorithmNames.SHA256,
			source,
			destination,
		);
		if (bytesWritten !== SHA256.hashSizeInBytes) {
			throw new Error('Assertion failed');
		}

		return new Ok(bytesWritten);
	}

	static hashDataCore(source: Buffer, destination: Buffer): number {
		const tryHashDataResult = SHA256.tryHashData(source, destination);
		if (!tryHashDataResult.ok) {
			throw new Error('Destination is too short.' /* LOC */);
		}

		return tryHashDataResult.val;
	}

	static hashData(source: Buffer): Buffer {
		const buffer = Buffer.alloc(SHA256.hashSizeInBytes);

		const written = SHA256.hashDataCore(source, buffer);
		if (written !== buffer.length) {
			throw new Error('Assertion failed.');
		}

		return buffer;
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/SHA256.cs,4fcaa40f09f5d3be
class Impl extends SHA256 {
	private readonly hashProvider: HashProvider;

	constructor() {
		super();

		this.hashProvider = createHashProvider(HashAlgorithmNames.SHA256);
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
