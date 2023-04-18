import { IDisposable } from '@yohira/base';
import { CipherMode } from 'node:crypto';

import { ICryptoTransform } from './ICryptoTransform';
import { isLegalSize } from './KeySizeHelpers';
import { KeySizes } from './KeySizes';
import { PaddingMode } from './PaddingMode';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/SymmetricAlgorithm.cs,97c6f2476150a40d,references
export abstract class SymmetricAlgorithm implements IDisposable {
	protected modeValue: CipherMode;
	protected paddingValue: PaddingMode;
	protected keyValue?: Buffer;
	protected ivValue?: Buffer;
	protected blockSizeValue = 0;
	protected feedbackSizeValue = 0;
	protected keySizeValue = 0;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	protected legalKeySizesValue: KeySizes[] = undefined!;

	protected constructor() {
		this.modeValue = 'cbc';
		this.paddingValue = PaddingMode.PKCS7;
	}

	get feedbackSize(): number {
		return this.feedbackSizeValue;
	}
	set feedbackSize(value: number) {
		if (value <= 0 || value > this.blockSizeValue || value % 8 !== 0) {
			throw new Error(
				'Specified feedback size is not valid for this algorithm.' /* LOC */,
			);
		}
		this.feedbackSizeValue = value;
	}

	get blockSize(): number {
		return this.blockSizeValue;
	}
	set blockSize(value: number) {
		// TODO
		throw new Error('Method not implemented.');
	}

	get iv(): Buffer {
		// TODO
		throw new Error('Method not implemented.');
	}
	set iv(value: Buffer) {
		// TODO
		throw new Error('Method not implemented.');
	}

	get key(): Buffer {
		// TODO
		throw new Error('Method not implemented.');
	}
	set key(value: Buffer) {
		// TODO
		throw new Error('Method not implemented.');
	}

	get legalKeySizes(): KeySizes[] {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return Array.from(this.legalKeySizesValue!);
	}

	validKeySize(bitLength: number): boolean {
		const validSizes = this.legalKeySizes;
		if (validSizes === undefined) {
			return false;
		}
		return isLegalSize(bitLength, validSizes, { set: () => {} });
	}

	get keySize(): number {
		return this.keySizeValue;
	}
	set keySize(value: number) {
		if (!this.validKeySize(value)) {
			throw new Error(
				'Specified key is not a valid size for this algorithm.' /* LOC */,
			);
		}

		this.keySizeValue = value;
		this.keyValue = undefined;
	}

	get mode(): CipherMode {
		return this.modeValue;
	}
	set mode(value: CipherMode) {
		if (!(value === 'cbc' || value === 'ecb' || value === 'cfb')) {
			throw new Error(
				'Specified cipher mode is not valid for this algorithm.' /* LOC */,
			);
		}

		this.modeValue = value;
	}

	get padding(): PaddingMode {
		return this.paddingValue;
	}
	set padding(value: PaddingMode) {
		if (value < PaddingMode.None || value > PaddingMode.ISO10126) {
			throw new Error(
				'Specified padding mode is not valid for this algorithm.' /* LOC */,
			);
		}
		this.paddingValue = value;
	}

	abstract createEncryptorCore(
		rgbKey: Buffer,
		rgbIV: Buffer | undefined,
	): ICryptoTransform;

	createEncryptor(): ICryptoTransform {
		// TODO: return this.createEncryptorCore(this.key, this.iv);
		throw new Error('Method not implemented.');
	}

	dispose(): void {
		if (this.keyValue !== undefined) {
			this.keyValue.fill(0);
			this.keyValue = undefined;
		}
		if (this.ivValue !== undefined) {
			this.ivValue.fill(0);
			this.ivValue = undefined;
		}
	}

	private getCiphertextLengthBlockAligned(
		plaintextLength: number,
		paddingMode: PaddingMode,
	): number {
		if (plaintextLength < 0) {
			throw new Error(
				`plaintextLength ('${plaintextLength}') must be a non-negative value.` /* LOC */,
			);
		}

		const blockSizeBits = this.blockSize; // The BlockSize property is in bits.

		if (blockSizeBits <= 0 || (blockSizeBits & 7) !== 0) {
			throw new Error(
				"The algorithm's block size is not supported." /* LOC */,
			);
		}

		const blockSizeBytes = blockSizeBits >> 3;
		const wholeBlocks =
			Math.floor(plaintextLength / blockSizeBytes) * blockSizeBytes;
		const remainder = plaintextLength % blockSizeBytes;

		switch (paddingMode) {
			case PaddingMode.None:
				if (remainder !== 0) {
					throw new Error(
						'The specified plaintext size is not valid for the padding and block size.' /* LOC */,
					);
				} else {
					return plaintextLength;
				}
			case PaddingMode.Zeros:
				if (remainder === 0) {
					return plaintextLength;
				} else {
					// TODO
					//throw new Error('Method not implemented.');

					return wholeBlocks + blockSizeBytes;
				}
			case PaddingMode.PKCS7:
			case PaddingMode.ANSIX923:
			case PaddingMode.ISO10126:
				// TODO
				//throw new Error('Method not implemented.');

				return wholeBlocks + blockSizeBytes;
			default:
				throw new Error(
					'Specified padding mode is not valid for this algorithm.' /* LOC */,
				);
		}
	}

	getCiphertextLengthEcb(
		plaintextLength: number,
		paddingMode: PaddingMode,
	): number {
		return this.getCiphertextLengthBlockAligned(
			plaintextLength,
			paddingMode,
		);
	}

	getCiphertextLengthCbc(
		plaintextLength: number,
		paddingMode = PaddingMode.PKCS7,
	): number {
		return this.getCiphertextLengthBlockAligned(
			plaintextLength,
			paddingMode,
		);
	}

	getCiphertextLengthCfb(
		plaintextLength: number,
		paddingMode = PaddingMode.None,
		feedbackSizeInBits = 8,
	): number {
		if (plaintextLength < 0) {
			throw new Error(
				`plaintextLength ('${plaintextLength}') must be a non-negative value.` /* LOC */,
			);
		}
		if (feedbackSizeInBits <= 0) {
			throw new Error(
				`feedbackSizeInBits ('${feedbackSizeInBits}') must be a non-negative and non-zero value.` /* LOC */,
			);
		}
		if ((feedbackSizeInBits & 7) !== 0) {
			throw new Error(
				'The value specified in bits must be a whole number of bytes.' /* LOC */,
			);
		}

		const feedbackSizeInBytes = feedbackSizeInBits >> 3;
		const feedbackAligned =
			Math.floor(plaintextLength / feedbackSizeInBytes) *
			feedbackSizeInBytes;
		const remainder = plaintextLength % feedbackSizeInBytes;

		switch (paddingMode) {
			case PaddingMode.None:
				if (remainder !== 0) {
					throw new Error(
						'The specified plaintext size is not valid for the padding and feedback size.' /* LOC */,
					);
				} else {
					return plaintextLength;
				}
			case PaddingMode.Zeros:
				if (remainder === 0) {
					return plaintextLength;
				} else {
					// TODO

					return feedbackAligned + feedbackSizeInBytes;
				}
			case PaddingMode.PKCS7:
			case PaddingMode.ANSIX923:
			case PaddingMode.ISO10126:
				// TODO

				return feedbackAligned + feedbackSizeInBytes;
			default:
				throw new Error(
					'Specified padding mode is not valid for this algorithm.' /* LOC */,
				);
		}
	}
}
