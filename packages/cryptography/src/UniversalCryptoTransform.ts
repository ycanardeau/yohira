import { BasicSymmetricCipher } from './BasicSymmetricCipher';
import { ICryptoTransform } from './ICryptoTransform';
import { PaddingMode } from './PaddingMode';
import {
	depaddingRequired,
	getCiphertextLength,
	getPaddingLength,
	padBlock,
} from './SymmetricPadding';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/UniversalCryptoTransform.cs,8ebb14d8760ff0cb,references
export abstract class UniversalCryptoTransform implements ICryptoTransform {
	get canTransformMultipleBlocks(): boolean {
		return true;
	}

	protected _paddingMode: PaddingMode;
	protected get paddingMode(): PaddingMode {
		return this._paddingMode;
	}
	private set paddingMode(value: PaddingMode) {
		this._paddingMode = value;
	}

	protected _basicSymmetricCipher: BasicSymmetricCipher;
	get basicSymmetricCipher(): BasicSymmetricCipher {
		return this._basicSymmetricCipher;
	}
	private set basicSymmetricCipher(value: BasicSymmetricCipher) {
		this._basicSymmetricCipher = value;
	}

	protected constructor(
		paddingMode: PaddingMode,
		basicSymmetricCipher: BasicSymmetricCipher,
	) {
		this._paddingMode = paddingMode;
		this._basicSymmetricCipher = basicSymmetricCipher;
	}

	get paddingSizeBytes(): number {
		return this.basicSymmetricCipher.paddingSizeInBytes;
	}

	get inputBlockSize(): number {
		return this.basicSymmetricCipher.blockSizeInBytes;
	}

	get outputBlockSize(): number {
		return this.basicSymmetricCipher.blockSizeInBytes;
	}

	static create(
		paddingMode: PaddingMode,
		cipher: BasicSymmetricCipher,
		encrypting: boolean,
	): UniversalCryptoTransform {
		if (encrypting) {
			return new UniversalCryptoEncryptor(paddingMode, cipher);
		} else {
			return new UniversalCryptoDecryptor(paddingMode, cipher);
		}
	}

	dispose(): void {
		this.basicSymmetricCipher.dispose();
	}

	protected abstract uncheckedTransformBlockCore(
		inputBuffer: Buffer,
		outputBuffer: Buffer,
	): number;

	protected uncheckedTransformBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
		outputBuffer: Buffer,
		outputOffset: number,
	): number {
		return this.uncheckedTransformBlockCore(
			inputBuffer.subarray(inputOffset, inputOffset + inputCount),
			outputBuffer.subarray(outputOffset),
		);
	}

	transformBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
		outputBuffer: Buffer,
		outputOffset: number,
	): number {
		if (inputBuffer === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}
		if (inputOffset < 0) {
			throw new Error(
				`inputOffset ('${inputOffset}') must be a non-negative value.` /* LOC */,
			);
		}
		if (inputOffset > inputBuffer.length) {
			throw new Error(
				`inputOffset ('${inputOffset}') must be less than or equal to '${inputBuffer.length}'.` /* LOC */,
			);
		}
		if (inputCount <= 0) {
			throw new Error(
				`inputCount ('${inputCount}') must be a non-negative and non-zero value.` /* LOC */,
			);
		}
		if (inputCount % this.inputBlockSize !== 0) {
			throw new Error(
				'TransformBlock may only process bytes in block sized increments.' /* LOC */,
			);
		}
		if (inputCount > inputBuffer.length - inputOffset) {
			throw new Error(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.' /* LOC */,
			);
		}

		if (outputBuffer === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}
		if (outputOffset > outputBuffer.length) {
			throw new Error(
				`outputOffset ('${outputOffset}') must be less than or equal to '${outputBuffer.length}'.` /* LOC */,
			);
		}
		if (inputCount > outputBuffer.length - outputOffset) {
			throw new Error(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.' /* LOC */,
			);
		}

		const numBytesWritten = this.uncheckedTransformBlock(
			inputBuffer,
			inputOffset,
			inputCount,
			outputBuffer,
			outputOffset,
		);
		if (numBytesWritten < 0 || numBytesWritten > inputCount) {
			throw new Error('Assertion failed.');
		}
		return numBytesWritten;
	}

	// For final block, encryption and decryption can give better context for the returning byte size, so we
	// don't provide an implementation here.
	protected abstract uncheckedTransformFinalBlockCore(
		inputBuffer: Buffer,
		outputBuffer: Buffer,
	): number;
	protected abstract uncheckedTransformFinalBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
	): Buffer;

	transformFinalBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
	): Buffer {
		if (inputBuffer === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}

		if (inputOffset < 0) {
			throw new Error(
				`inputOffset ('${inputOffset}') must be a non-negative value.` /* LOC */,
			);
		}
		if (inputCount < 0) {
			throw new Error(
				`inputCount ('${inputCount}') must be a non-negative value.` /* LOC */,
			);
		}
		if (inputOffset > inputBuffer.length) {
			throw new Error(
				`inputOffset ('${inputOffset}') must be less than or equal to '${inputBuffer.length}'.` /* LOC */,
			);
		}
		if (inputCount > inputBuffer.length - inputOffset) {
			throw new Error(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.' /* LOC */,
			);
		}

		const output = this.uncheckedTransformFinalBlock(
			inputBuffer,
			inputOffset,
			inputCount,
		);
		return output;
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/UniversalCryptoEncryptor.cs,b1cb5bf0fdf4d5ec,references
export class UniversalCryptoEncryptor extends UniversalCryptoTransform {
	constructor(
		paddingMode: PaddingMode,
		basicSymmetricCipher: BasicSymmetricCipher,
	) {
		super(paddingMode, basicSymmetricCipher);
	}

	protected uncheckedTransformBlockCore(
		inputBuffer: Buffer,
		outputBuffer: Buffer,
	): number {
		return this.basicSymmetricCipher.transform(inputBuffer, outputBuffer);
	}

	protected uncheckedTransformFinalBlockCore(
		inputBuffer: Buffer,
		outputBuffer: Buffer,
	): number {
		// The only caller of this method is the array-allocating overload, outputBuffer is
		// always new memory, not a user-provided buffer.
		// TODO: assert

		const padWritten = padBlock(
			inputBuffer,
			outputBuffer,
			this.paddingSizeBytes,
			this.paddingMode,
		);
		const transformWritten = this.basicSymmetricCipher.transformFinal(
			outputBuffer.subarray(0, padWritten),
			outputBuffer,
		);

		// After padding, we should have an even number of blocks, and the same applies
		// to the transform.
		if (padWritten !== transformWritten) {
			throw new Error('Assertion failed.');
		}

		return transformWritten;
	}

	protected uncheckedTransformFinalBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
	): Buffer {
		const ciphertextLength = getCiphertextLength(
			inputCount,
			this.paddingSizeBytes,
			this.paddingMode,
		);
		const buffer = Buffer.alloc(ciphertextLength);
		const written = this.uncheckedTransformFinalBlockCore(
			inputBuffer.subarray(inputOffset, inputOffset + inputCount),
			buffer,
		);
		if (written !== buffer.length) {
			throw new Error('Assertion failed.');
		}
		return buffer;
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/UniversalCryptoDecryptor.cs,ce94e293a9107217,references
export class UniversalCryptoDecryptor extends UniversalCryptoTransform {
	//
	// For padding modes that support automatic depadding, transformBlock() leaves the last block it is given undone since it has no way of knowing
	// whether this is the final block that needs depadding. This block is held (in encrypted form) in heldoverCipher. The next call to transformBlock
	// or transformFinalBlock must include the decryption of heldoverCipher in the results.
	//
	private heldoverCipher?: Buffer;

	constructor(
		paddingMode: PaddingMode,
		basicSymmetricCipher: BasicSymmetricCipher,
	) {
		super(paddingMode, basicSymmetricCipher);
	}

	protected uncheckedTransformBlockCore(
		inputBuffer: Buffer,
		outputBuffer: Buffer,
	): number {
		//
		// If we're decrypting, it's possible to be called with the last blocks of the data, and then
		// have transformFinalBlock called with an empty array. Since we don't know if this is the case,
		// we won't decrypt the last block of the input until either transformBlock or
		// transformFinalBlock is next called.
		//
		// We don't need to do this for PaddingMode.None because there is no padding to strip, and
		// we also don't do this for PaddingMode.Zeros since there is no way for us to tell if the
		// zeros at the end of a block are part of the plaintext or the padding.
		//
		let decryptedBytes = 0;
		if (depaddingRequired(this.paddingMode)) {
			// If we have data saved from a previous call, decrypt that into the output first
			if (this.heldoverCipher !== undefined) {
				const depadDecryptLength = this.basicSymmetricCipher.transform(
					this.heldoverCipher,
					outputBuffer,
				);
				outputBuffer = outputBuffer.subarray(depadDecryptLength);
				decryptedBytes += depadDecryptLength;
			} else {
				this.heldoverCipher = Buffer.alloc(this.inputBlockSize);
			}

			// Postpone the last block to the next round.
			if (inputBuffer.length < this.heldoverCipher.length) {
				throw new Error('inputBuffer.Length >= _heldoverCipher.Length');
			}
			inputBuffer
				.subarray(inputBuffer.length - this.heldoverCipher.length)
				.copy(this.heldoverCipher);
			inputBuffer = inputBuffer.subarray(
				0,
				inputBuffer.length - this.heldoverCipher.length,
			);
			if (inputBuffer.length % this.inputBlockSize !== 0) {
				throw new Error('Did not remove whole blocks for depadding');
			}
		}

		if (inputBuffer.length > 0) {
			decryptedBytes += this.basicSymmetricCipher.transform(
				inputBuffer,
				outputBuffer,
			);
		}

		return decryptedBytes;
	}

	private reset(): void {
		if (this.heldoverCipher !== undefined) {
			this.heldoverCipher.fill(0);
			this.heldoverCipher = undefined;
		}
	}

	protected uncheckedTransformFinalBlockCore(
		inputBuffer: Buffer,
		outputBuffer: Buffer,
	): number {
		// We can't complete decryption on a partial block
		if (inputBuffer.length % this.paddingSizeBytes !== 0) {
			throw new Error(
				'The input data is not a complete block.' /* LOC */,
			);
		}

		let inputCiphertext: Buffer;
		let ciphertext: Buffer;
		// TODO

		try {
			if (this.heldoverCipher === undefined) {
				// TODO
				ciphertext = Buffer.alloc(inputBuffer.length);
				inputCiphertext = inputBuffer;
			} else {
				// TODO
				throw new Error('Method not implemented.');
			}

			let unpaddedLength = 0;

			// TODO
			// Decrypt the data, then strip the padding to get the final decrypted data. Note that even if the cipherText length is 0, we must
			// invoke TransformFinal() so that the cipher object knows to reset for the next cipher operation.
			const decryptWritten = this.basicSymmetricCipher.transformFinal(
				inputCiphertext,
				ciphertext,
			);
			const decryptedBytes = ciphertext.subarray(0, decryptWritten);

			if (decryptedBytes.length > 0) {
				unpaddedLength = getPaddingLength(
					decryptedBytes,
					this.paddingMode,
					this.inputBlockSize,
				);
				decryptedBytes.subarray(0, unpaddedLength).copy(outputBuffer);
			}

			this.reset();
			return unpaddedLength;
		} finally {
			// TODO
		}
	}

	protected uncheckedTransformFinalBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
	): Buffer {
		if (depaddingRequired(this.paddingMode)) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			const buffer = Buffer.alloc(inputCount);
			const written = this.uncheckedTransformFinalBlockCore(
				inputBuffer.subarray(inputOffset, inputOffset + inputCount),
				buffer,
			);
			if (written !== buffer.length) {
				throw new Error('Assertion failed.');
			}
			return buffer;
		}
	}

	dispose(): void {
		const heldoverCipher = this.heldoverCipher;
		this.heldoverCipher = undefined;
		if (heldoverCipher !== undefined) {
			heldoverCipher.fill(0);
		}

		super.dispose();
	}
}
