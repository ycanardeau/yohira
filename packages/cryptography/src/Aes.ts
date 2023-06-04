import { CipherMode, randomBytes } from 'node:crypto';

import { ICryptoTransform } from './ICryptoTransform';
import { cloneKeySizesArray } from './KeySizeHelpers';
import { KeySizes } from './KeySizes';
import { OpenSslCipher } from './OpenSslCipher';
import { PaddingMode } from './PaddingMode';
import { SymmetricAlgorithm } from './SymmetricAlgorithm';
import { UniversalCryptoTransform } from './UniversalCryptoTransform';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/Aes.cs,ddb5f33f82818174,references
export abstract class Aes extends SymmetricAlgorithm {
	private static readonly legalBlockSizes = [new KeySizes(128, 128, 0)];
	private static readonly legalKeySizes = [new KeySizes(128, 256, 64)];

	protected constructor() {
		super();

		this.legalBlockSizesValue = cloneKeySizesArray(Aes.legalBlockSizes);
		this.legalKeySizesValue = cloneKeySizesArray(Aes.legalKeySizes);

		this.blockSizeValue = 128;
		this.feedbackSizeValue = 8;
		this.keySizeValue = 256;
		this.modeValue = 'cbc';
	}

	static create(): Aes {
		return new AesImpl();
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/Helpers.cs,7d31ec60e2b9a33b,references
function getPaddingSize(
	algorithm: SymmetricAlgorithm,
	mode: CipherMode,
	feedbackSizeInBits: number,
): number {
	return (mode === 'cfb' ? feedbackSizeInBits : algorithm.blockSize) / 8;
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/AesImplementation.cs,5082aa2bd9ae096d,references
class AesImpl extends Aes {
	private static readonly bitsPerByte = 8;

	private static getAlgorithm(
		keySize: number,
		feedback: number,
		cipherMode: CipherMode,
	): string {
		// Neither OpenSSL nor Cng Aes support CTS mode.

		switch (keySize) {
			case 128:
				switch (cipherMode) {
					case 'cbc':
						return 'aes-128-cbc';
					case 'ecb':
						return 'aes-128-ecb';
					case 'cfb':
						if (feedback === 8) {
							return 'aes-128-cfb8';
						} else if (feedback === 128) {
							return 'aes-128-cfb128';
						} else {
							throw new Error(
								'Specified method is not supported.' /* LOC */,
							);
						}
					default:
						throw new Error(
							'Specified method is not supported.' /* LOC */,
						);
				}
				break;

			case 192:
				switch (cipherMode) {
					case 'cbc':
						return 'aes-192-cbc';
					case 'ecb':
						return 'aes-192-ecb';
					case 'cfb':
						if (feedback === 8) {
							return 'aes-192-cfb8';
						} else if (feedback === 128) {
							return 'aes-192-cfb128';
						} else {
							throw new Error(
								'Specified method is not supported.' /* LOC */,
							);
						}
					default:
						throw new Error(
							'Specified method is not supported.' /* LOC */,
						);
				}
				break;

			case 256:
				switch (cipherMode) {
					case 'cbc':
						return 'aes-256-cbc';
					case 'ecb':
						return 'aes-256-ecb';
					case 'cfb':
						if (feedback === 8) {
							return 'aes-256-cfb8';
						} else if (feedback === 128) {
							return 'aes-256-cfb128';
						} else {
							throw new Error(
								'Specified method is not supported.' /* LOC */,
							);
						}
					default:
						throw new Error(
							'Specified method is not supported.' /* LOC */,
						);
				}
				break;

			default:
				throw new Error(
					'Specified key is not a valid size for this algorithm.' /* LOC */,
				);
		}
	}

	private createTransformCore(
		cipherMode: CipherMode,
		paddingMode: PaddingMode,
		key: Buffer,
		iv: Buffer | undefined,
		blockSize: number,
		paddingSize: number,
		feedback: number,
		encrypting: boolean,
	): UniversalCryptoTransform {
		const algorithm = AesImpl.getAlgorithm(
			key.length * 8,
			feedback * 8,
			cipherMode,
		);

		const cipher = new OpenSslCipher(
			algorithm,
			cipherMode,
			blockSize,
			paddingSize,
			key,
			iv,
			encrypting,
		);
		return UniversalCryptoTransform.create(paddingMode, cipher, encrypting);
	}

	private static validateCFBFeedbackSize(feedback: number): void {
		// only 8bits/128bits feedback would be valid.
		if (feedback !== 8 && feedback !== 128) {
			throw new Error(
				`The specified feedback size '${feedback}' for CipherMode 'cfb' is not supported.` /* LOC */,
			);
		}
	}

	private createTransform(
		rgbKey: Buffer,
		rgbIV: Buffer | undefined,
		encrypting: boolean,
	): UniversalCryptoTransform {
		if (rgbKey === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}

		// note: rbgIV is guaranteed to be cloned before this method, so no need to clone it again

		const keySize = rgbKey.length * AesImpl.bitsPerByte;
		// TODO

		if (rgbIV !== undefined) {
			const ivSize = rgbIV.length * AesImpl.bitsPerByte;
			if (ivSize !== this.blockSize) {
				throw new Error(
					'Specified initialization vector (IV) does not match the block size for this algorithm.' /* LOC */,
				);
			}
		}

		if (this.mode === 'cfb') {
			AesImpl.validateCFBFeedbackSize(this.feedbackSize);
		}

		return this.createTransformCore(
			this.mode,
			this.padding,
			rgbKey,
			rgbIV,
			this.blockSize / AesImpl.bitsPerByte,
			getPaddingSize(this, this.mode, this.feedbackSize),
			this.feedbackSize / AesImpl.bitsPerByte,
			encrypting,
		);
	}

	createDecryptorCore(
		rgbKey: Buffer,
		rgbIV: Buffer | undefined,
	): ICryptoTransform {
		return this.createTransform(
			rgbKey,
			rgbIV !== undefined ? Buffer.from(rgbIV) : undefined,
			false,
		);
	}

	createDecryptor(): ICryptoTransform {
		return this.createTransform(this.key, this.iv, false);
	}

	createEncryptorCore(
		rgbKey: Buffer,
		rgbIV: Buffer | undefined,
	): ICryptoTransform {
		return this.createTransform(
			rgbKey,
			rgbIV !== undefined ? Buffer.from(rgbIV) : undefined,
			true,
		);
	}

	createEncryptor(): ICryptoTransform {
		return this.createTransform(this.key, this.iv, true);
	}

	generateIV(): void {
		this.iv = randomBytes(this.blockSize / AesImpl.bitsPerByte);
	}

	generateKey(): void {
		this.key = randomBytes(this.keySize / AesImpl.bitsPerByte);
	}
}
