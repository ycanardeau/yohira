import { HashAlgorithmNames } from './HashAlgorithmNames';
import { HashProvider } from './HashProvider';
import { createMacProvider } from './HashProviderDispenser';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HMACCommon.cs,476a4b33de497f59,references
export class HMACCommon {
	private hMacProvider: HashProvider = undefined!;

	// The actual key used for hashing. This will not be the same as the original key passed to ChangeKey() if the original key exceeded the
	// hash algorithm's block size. (See RFC 2104, section 2)
	_actualKey?: Buffer;
	get actualKey(): Buffer | undefined {
		return this._actualKey;
	}
	private set actualKey(value: Buffer | undefined) {
		this._actualKey = value;
	}

	get hashSizeInBits(): number {
		return this.hMacProvider.hashSizeInBytes * 8;
	}
	get hashSizeInBytes(): number {
		return this.hMacProvider.hashSizeInBytes;
	}

	private changeKeyImpl(key: Buffer): Buffer | undefined {
		const modifiedKey: Buffer | undefined = undefined;

		// If _blockSize is -1 the key isn't going to be extractable by the object holder,
		// so there's no point in recalculating it in managed code.
		if (key.length > this.blockSize && this.blockSize > 0) {
			// Perform RFC 2104, section 2 key adjustment.
			switch (this.hashAlgorithmId) {
				case HashAlgorithmNames.SHA256:
					// TODO
					throw new Error('Method not implemented.');
				case HashAlgorithmNames.SHA384:
					// TODO
					throw new Error('Method not implemented.');
				case HashAlgorithmNames.SHA512:
					// TODO
					throw new Error('Method not implemented.');
				case HashAlgorithmNames.SHA1:
					// TODO
					throw new Error('Method not implemented.');
				case HashAlgorithmNames.MD5:
					// TODO
					throw new Error('Method not implemented.');
				default:
					throw new Error(
						`'${this.hashAlgorithmId}' is not a known hash algorithm.`,
					);
			}
		}

		const oldHashProvider = this.hMacProvider;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.hMacProvider = undefined!;
		oldHashProvider?.dispose();
		this.hMacProvider = createMacProvider(this.hashAlgorithmId, key);

		return modifiedKey;
	}

	constructor(
		private readonly hashAlgorithmId: string,
		key: Buffer,
		private readonly blockSize: number,
	) {
		if (!hashAlgorithmId) {
			throw new Error('Assertion failed');
		}
		if (blockSize < 0 && blockSize !== -1) {
			throw new Error('Assertion failed.');
		}

		// note: will not set ActualKey if key size is smaller or equal than blockSize
		//       this is to avoid extra allocation. ActualKey can still be used if key is generated.
		//       Otherwise the ReadOnlySpan overload would actually be slower than byte array overload.
		this.actualKey = this.changeKeyImpl(key);
	}

	// Adds new data to be hashed. This can be called repeatedly in order to hash data from noncontiguous sources.
	appendHashData(data: Buffer, offset: number, count: number): void {
		return this.hMacProvider.appendHashData(data, offset, count);
	}

	// Compute the hash based on the appended data and resets the HashProvider for more hashing.
	finalizeHashAndReset(): Buffer {
		return this.hMacProvider.finalizeHashAndReset();
	}

	reset(): void {
		return this.hMacProvider.reset();
	}

	dispose(): void {
		this.hMacProvider?.dispose();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.hMacProvider = undefined!;
	}
}
