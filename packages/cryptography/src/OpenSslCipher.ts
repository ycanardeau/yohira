import { CipherMode } from 'node:crypto';

import { BasicSymmetricCipher } from './BasicSymmetricCipher';
import { OpenSslCipherLite } from './OpenSslCipherLite';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/Helpers.cs,6a60b07708d024c6,references
function useIv(cipherMode: CipherMode): boolean {
	return cipherMode !== 'ecb';
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/Helpers.cs,e66ba1e27c8d6127,references
function getCipherIv(
	cipherMode: CipherMode,
	iv: Buffer | undefined,
): Buffer | undefined {
	if (useIv(cipherMode)) {
		if (iv === undefined) {
			throw new Error(
				'The cipher mode specified requires that an initialization vector (IV) be used.' /* LOC */,
			);
		}

		return iv;
	}

	return undefined;
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/OpenSslCipher.cs,8c513e46e6089cec,references
export class OpenSslCipher extends BasicSymmetricCipher {
	private readonly cipherLite: OpenSslCipherLite;

	constructor(
		algorithm: string,
		cipherMode: CipherMode,
		blockSizeInBytes: number,
		paddingSizeInBytes: number,
		key: Buffer,
		iv: Buffer | undefined,
		encrypting: boolean,
	) {
		super(
			getCipherIv(cipherMode, iv),
			blockSizeInBytes,
			paddingSizeInBytes,
		);

		this.cipherLite = new OpenSslCipherLite(
			algorithm,
			blockSizeInBytes,
			paddingSizeInBytes,
			key,
			iv ?? Buffer.alloc(0) /* REVIEW */,
			encrypting,
		);
	}

	[Symbol.dispose](): void {
		this.cipherLite[Symbol.dispose]();

		super[Symbol.dispose]();
	}

	transform(input: Buffer, output: Buffer): number {
		if (input.length <= 0) {
			throw new Error('Assertion failed.');
		}
		if (input.length % this.paddingSizeInBytes !== 0) {
			throw new Error('Assertion failed.');
		}
		return this.cipherLite.transform(input, output);
	}

	transformFinal(input: Buffer, output: Buffer): number {
		if (input.length % this.paddingSizeInBytes !== 0) {
			throw new Error('Assertion failed.');
		}
		if (input.length > output.length) {
			throw new Error('Assertion failed.');
		}

		const written = this.cipherLite.transformFinal(input, output);
		this.cipherLite.reset(this.iv ?? Buffer.alloc(0) /* REVIEW */);
		return written;
	}
}
