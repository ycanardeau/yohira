import { using } from '@yohira/base';
import {
	Aes,
	ICryptoTransform,
	KeySizes,
	PaddingMode,
} from '@yohira/cryptography';
import { CipherMode } from 'node:crypto';
import { expect, test } from 'vitest';

class AesMinimal extends Aes {
	// If the constructor uses a virtual call to any of the property setters
	// they will fail.
	private readonly ready: boolean;

	constructor() {
		super();

		// Don't set this as a field initializer, otherwise it runs before the base ctor.
		this.ready = true;
	}

	get keySize(): number {
		return super.keySize;
	}
	set keySize(value: number) {
		if (!this.ready) {
			throw new Error(/* TODO: message */);
		}

		super.keySize = value;
	}

	get blockSize(): number {
		return super.blockSize;
	}
	set blockSize(value: number) {
		if (!this.ready) {
			throw new Error(/* TODO: message */);
		}

		super.blockSize = value;
	}

	get iv(): Buffer {
		return super.iv;
	}
	set iv(value: Buffer) {
		if (!this.ready) {
			throw new Error(/* TODO: message */);
		}

		super.iv = value;
	}

	get key(): Buffer {
		return super.key;
	}
	set key(value: Buffer) {
		if (!this.ready) {
			throw new Error(/* TODO: message */);
		}

		super.key = value;
	}

	get mode(): CipherMode {
		return super.mode;
	}
	set mode(value: CipherMode) {
		if (!this.ready) {
			throw new Error(/* TODO: message */);
		}

		super.mode = value;
	}

	get padding(): PaddingMode {
		return super.padding;
	}
	set padding(value: PaddingMode) {
		if (!this.ready) {
			throw new Error(/* TODO: message */);
		}

		super.padding = value;
	}

	generateIV(): void {
		throw new Error('Method not implemented.');
	}

	generateKey(): void {
		throw new Error('Method not implemented.');
	}

	createDecryptorCore(): ICryptoTransform {
		throw new Error('Method not implemented.');
	}

	createEncryptorCore(): ICryptoTransform {
		throw new Error('Method not implemented.');
	}
}

class AesLegalSizesBreaker extends AesMinimal {
	constructor() {
		super();

		this.legalKeySizesValue[0] = new KeySizes(1, 1, 0);
		this.legalBlockSizesValue[0] = new KeySizes(1, 1, 0);
	}
}

// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/AesTests.cs#L12
test('AesDefaultCtor', () => {
	using(new AesMinimal(), (aes) => {
		expect(aes.keySize).toBe(256);
		expect(aes.blockSize).toBe(128);
		expect(aes.feedbackSize).toBe(8);
		expect(aes.mode).toBe('cbc');
		expect(aes.padding).toBe(PaddingMode.PKCS7);
	});
});

// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/AesTests.cs#L25
test('EnsureLegalSizesValuesIsolated', () => {
	new AesLegalSizesBreaker()[Symbol.dispose]();

	using(Aes.create(), (aes) => {
		expect(aes.legalKeySizes[0].minSize).toBe(128);
		expect(aes.legalBlockSizes[0].minSize).toBe(128);

		aes.key = Buffer.alloc(16);
	});
});
