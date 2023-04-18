import {
	Cipher,
	Decipher,
	createCipheriv,
	createDecipheriv,
} from 'node:crypto';

import { ILiteSymmetricCipher } from './ILiteSymmetricCipher';

// REVIEW
// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/OpenSslCipherLite.cs,323191ebeccfa150,references
export class OpenSslCipherLite implements ILiteSymmetricCipher {
	private readonly ctx: Cipher | Decipher;

	private isFinalized = false;

	constructor(
		algorithm: string,
		readonly blockSizeInBytes: number,
		readonly paddingSizeInBytes: number,
		key: Buffer,
		iv: Buffer,
		encrypting: boolean,
	) {
		this.ctx = encrypting
			? createCipheriv(algorithm, key, iv)
			: createDecipheriv(algorithm, key, iv);

		// TODO

		// OpenSSL will happily do PKCS#7 padding for us, but since we support padding modes
		// that it doesn't (PaddingMode.Zeros) we'll just always pad the blocks ourselves.
		this.ctx.setAutoPadding(false);
	}

	private cipherUpdate(input: Buffer, output: Buffer): number {
		const buffer = this.ctx.update(input);
		buffer.copy(output);
		const bytesWritten = buffer.length;

		return bytesWritten;
	}

	transformFinal(input: Buffer, output: Buffer): number {
		if (this.isFinalized) {
			throw new Error('Cipher was reused without being reset.');
		}

		this.isFinalized = true;

		if (false /* TODO */) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			let written = this.cipherUpdate(input, output);
			const outputSubarray = output.subarray(written);
			// TODO
			const finalWritten = 0; /* TODO */
			written += finalWritten;
			return written;
		}
	}

	transform(input: Buffer, output: Buffer): number {
		if (this.isFinalized) {
			throw new Error('Cipher was reused without being reset.');
		}

		// TODO
		//throw new Error('Method not implemented.');

		return this.cipherUpdate(input, output);
	}

	reset(iv: Buffer): void {
		// TODO
		//throw new Error('Method not implemented.');

		this.isFinalized = false;
	}

	dispose(): void {
		// TODO
		//throw new Error('Method not implemented.');
	}
}
