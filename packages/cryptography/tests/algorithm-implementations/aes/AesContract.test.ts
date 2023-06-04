import { using } from '@yohira/base';
import { Aes, ICryptoTransform, PaddingMode } from '@yohira/cryptography';
import { expect, test } from 'vitest';

import { AesFactory } from './AesFactory';

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L16
test('VerifyDefaults', () => {
	using(AesFactory.create(), (aes) => {
		expect(aes.blockSize).toBe(128);
		expect(aes.keySize).toBe(256);
		expect(aes.feedbackSize).toBe(8);
		expect(aes.mode).toBe('cbc');
		expect(aes.padding).toBe(PaddingMode.PKCS7);
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L29
test('LegalBlockSizes', () => {
	using(AesFactory.create(), (aes) => {
		const blockSizes = aes.legalBlockSizes;

		expect(blockSizes).not.toBeUndefined();
		expect(blockSizes.length).toBe(1);

		const blockSizeLimits = blockSizes[0];

		expect(blockSizeLimits.minSize).toBe(128);
		expect(blockSizeLimits.maxSize).toBe(128);
		expect(blockSizeLimits.skipSize).toBe(0);
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L47
test('LegalKeySizes', () => {
	using(AesFactory.create(), (aes) => {
		const keySizes = aes.legalKeySizes;

		expect(keySizes).not.toBeUndefined();
		expect(keySizes.length).toBe(1);

		const keySizeLimits = keySizes[0];

		expect(keySizeLimits.minSize).toBe(128);
		expect(keySizeLimits.maxSize).toBe(256);
		expect(keySizeLimits.skipSize).toBe(64);
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L70
test('InvalidKeySizes', () => {
	function InvalidKeySizes(
		invalidKeySize: number,
		skipOnNetfx: boolean,
	): void {
		// TODO

		using(AesFactory.create(), (aes) => {
			// Test KeySize property
			expect(() => (aes.keySize = invalidKeySize)).toThrowError(
				'Specified key is not a valid size for this algorithm.',
			);

			// Test passing a key to CreateEncryptor and CreateDecryptor
			aes.generateIV();
			const iv = aes.iv;
			// TODO: try
			const key = Buffer.alloc(invalidKeySize);
			expect(() => aes.createEncryptorCore(key, iv)).toThrowError(
				'Specified key is not a valid size for this algorithm.',
			);

			expect(() => aes.createDecryptorCore(key, iv)).toThrowError(
				'Specified key is not a valid size for this algorithm.',
			);
		});
	}

	InvalidKeySizes(64, false); // too small
	InvalidKeySizes(129, false); // in valid range but not valid increment
	InvalidKeySizes(384, false); // too large
	InvalidKeySizes(536870928, true); // number of bits overflows and wraps around to a valid size
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L111
test('InvalidCFBFeedbackSizes', () => {
	function InvalidCFBFeedbackSizes(
		feedbackSize: number,
		discoverableInSetter: boolean,
	): void {
		using(AesFactory.create(), (aes) => {
			aes.generateKey();
			aes.mode = 'cfb';

			if (discoverableInSetter) {
				// there are some key sizes that are invalid for any of the modes,
				// so the exception is thrown in the setter
				expect(() => (aes.feedbackSize = feedbackSize)).toThrowError(
					'Specified feedback size is not valid for this algorithm.',
				);
			} else {
				aes.feedbackSize = feedbackSize;

				// however, for CFB only few sizes are valid. Those should throw in the
				// actual AES instantiation.

				expect(() => aes.createDecryptor()).toThrowError(
					`The specified feedback size '${feedbackSize}' for CipherMode '${aes.mode}' is not supported.`,
				);
				expect(() => aes.createEncryptor()).toThrowError(
					`The specified feedback size '${feedbackSize}' for CipherMode '${aes.mode}' is not supported.`,
				);
			}
		});
	}

	InvalidCFBFeedbackSizes(0, true);
	InvalidCFBFeedbackSizes(1, true);
	InvalidCFBFeedbackSizes(7, true);
	InvalidCFBFeedbackSizes(9, true);
	InvalidCFBFeedbackSizes(-1, true);
	InvalidCFBFeedbackSizes(2147483647, true);
	InvalidCFBFeedbackSizes(-2147483648, true);
	InvalidCFBFeedbackSizes(64, false);
	InvalidCFBFeedbackSizes(256, true);
	InvalidCFBFeedbackSizes(127, true);
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L143
test('ValidCFBFeedbackSizes', () => {
	function ValidCFBFeedbackSizes(feedbackSize: number): void {
		if (feedbackSize !== 8 /* TODO */) {
			return;
		}

		using(AesFactory.create(), (aes) => {
			aes.generateKey();
			aes.mode = 'cfb';

			aes.feedbackSize = feedbackSize;

			using(aes.createDecryptor(), (decryptor) => {
				using(aes.createEncryptor(), (encryptor) => {
					expect(decryptor).not.toBeUndefined();
					expect(encryptor).not.toBeUndefined();
				});
			});
		});
	}

	ValidCFBFeedbackSizes(8);
	ValidCFBFeedbackSizes(128);
});

// TODO

function verifyKeyGeneration(aes: Aes): void {
	const keySize = aes.keySize;
	aes.generateKey();

	const key = aes.key;

	expect(key).not.toBeUndefined();
	expect(aes.keySize).toBe(keySize);
	expect(key.length * 8).toBe(keySize);

	// Standard randomness caveat: There's a very low chance that the generated key -is-
	// all zeroes.  For a 128-bit key this is 1/2^128, which is more unlikely than 1/10^38.
	expect(key.equals(Buffer.alloc(key.length))).toBe(false);
}

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L201
test('VerifyKeyGeneration_Default', () => {
	using(AesFactory.create(), (aes) => {
		verifyKeyGeneration(aes);
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L210
test('VerifyKeyGeneration_128', () => {
	using(AesFactory.create(), (aes) => {
		aes.keySize = 128;
		verifyKeyGeneration(aes);
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L220
test('VerifyKeyGeneration_192', () => {
	using(AesFactory.create(), (aes) => {
		aes.keySize = 192;
		verifyKeyGeneration(aes);
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L230
test('VerifyKeyGeneration_256', () => {
	using(AesFactory.create(), (aes) => {
		aes.keySize = 256;
		verifyKeyGeneration(aes);
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L240
test('VerifyIVGeneration', () => {
	using(AesFactory.create(), (aes) => {
		const blockSize = aes.blockSize;
		aes.generateIV();

		const iv = aes.iv;

		expect(iv).not.toBeUndefined();
		expect(aes.blockSize).toBe(blockSize);
		expect(iv.length * 8).toBe(blockSize);

		expect(iv.equals(Buffer.alloc(iv.length))).toBe(false);
	});
});

function validateTransformProperties(
	aes: Aes,
	transform: ICryptoTransform,
): void {
	expect(transform).not.toBeUndefined();
	expect(transform.inputBlockSize * 8).toBe(aes.blockSize);
	expect(transform.outputBlockSize * 8).toBe(aes.blockSize);
	expect(transform.canTransformMultipleBlocks).toBe(true);
}

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L260
test('ValidateEncryptorProperties', () => {
	using(AesFactory.create(), (aes) => {
		using(aes.createEncryptor(), (encryptor) => {
			validateTransformProperties(aes, encryptor);
		});
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L271
test('ValidateDecryptorProperties', () => {
	using(AesFactory.create(), (aes) => {
		using(aes.createDecryptor(), (decryptor) => {
			validateTransformProperties(aes, decryptor);
		});
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L281
test('CreateTransformExceptions', () => {
	const [key, iv] = using(AesFactory.create(), (aes) => {
		aes.generateKey();
		aes.generateIV();

		return [aes.key, aes.iv];
	});

	using(AesFactory.create(), (aes) => {
		aes.mode = 'cbc';

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect(() => aes.createEncryptorCore(undefined!, iv)).toThrowError(
			'Value cannot be undefined.',
		);
		expect(() =>
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			aes.createEncryptorCore(undefined!, undefined),
		).toThrowError('Value cannot be undefined.');

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect(() => aes.createDecryptorCore(undefined!, iv)).toThrowError(
			'Value cannot be undefined.',
		);
		expect(() =>
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			aes.createDecryptorCore(undefined!, undefined),
		).toThrowError('Value cannot be undefined.');

		// CBC requires an IV.
		expect(() => aes.createEncryptorCore(key, undefined)).toThrowError(
			'The cipher mode specified requires that an initialization vector (IV) be used.',
		);

		expect(() => aes.createDecryptorCore(key, undefined)).toThrowError(
			'The cipher mode specified requires that an initialization vector (IV) be used.',
		);
	});

	using(AesFactory.create(), (aes) => {
		aes.mode = 'ecb';

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect(() => aes.createEncryptorCore(undefined!, iv)).toThrowError(
			'Value cannot be undefined.',
		);
		expect(() =>
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			aes.createEncryptorCore(undefined!, undefined),
		).toThrowError('Value cannot be undefined.');

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect(() => aes.createDecryptorCore(undefined!, iv)).toThrowError(
			'Value cannot be undefined.',
		);
		expect(() =>
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			aes.createDecryptorCore(undefined!, undefined),
		).toThrowError('Value cannot be undefined.');

		// ECB will accept an IV (but ignore it), and doesn't require it.
		using(aes.createEncryptorCore(key, undefined), (didNotThrow) => {
			expect(didNotThrow).not.toBeUndefined();
		});

		using(aes.createDecryptorCore(key, undefined), (didNotThrow) => {
			expect(didNotThrow).not.toBeUndefined();
		});
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L335
test('ValidateOffsetAndCount', () => {
	using(AesFactory.create(), (aes) => {
		aes.generateKey();
		aes.generateIV();

		// aes.BlockSize is in bits, new byte[] is in bytes, so we have 8 blocks.
		const full = Buffer.alloc(aes.blockSize);
		const blockByteCount = aes.blockSize / 8;

		for (let i = 0; i < full.length; i++) {
			full[i] = i;
		}

		const firstBlock = Buffer.alloc(blockByteCount);
		const middleHalf = Buffer.alloc(4 * blockByteCount);

		// Copy the first blockBytes of full into firstBlock.
		full.copy(firstBlock, 0, 0, blockByteCount);

		// [Skip][Skip][Take][Take][Take][Take][Skip][Skip] => "middle half"
		full.copy(
			middleHalf,
			0,
			2 * blockByteCount,
			2 * blockByteCount + middleHalf.length,
		);

		const firstBlockEncrypted = using(
			aes.createEncryptor(),
			(encryptor) => {
				return encryptor.transformFinalBlock(
					firstBlock,
					0,
					firstBlock.length,
				);
			},
		);

		const firstBlockEncryptedFromCount = using(
			aes.createEncryptor(),
			(encryptor) => {
				return encryptor.transformFinalBlock(
					full,
					0,
					firstBlock.length,
				);
			},
		);

		const middleHalfEncrypted = using(
			aes.createEncryptor(),
			(encryptor) => {
				return encryptor.transformFinalBlock(
					middleHalf,
					0,
					middleHalf.length,
				);
			},
		);

		const middleHalfEncryptedFromOffsetAndCount = using(
			aes.createEncryptor(),
			(encryptor) => {
				return encryptor.transformFinalBlock(
					full,
					2 * blockByteCount,
					middleHalf.length,
				);
			},
		);

		expect(firstBlockEncryptedFromCount.equals(firstBlockEncrypted)).toBe(
			true,
		);
		expect(
			middleHalfEncryptedFromOffsetAndCount.equals(middleHalfEncrypted),
		).toBe(true);
	});
});

// https://github.com/dotnet/runtime/blob/da1da02bbd2cb54490b7fc22f43ec32f5f302615/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesContractTests.cs#L391
test('Cfb8ModeCanDepadCfb128Padding', () => {
	using(AesFactory.create(), (aes) => {
		// 1, 2, 3, 4, 5 encrypted with CFB8 but padded with block-size padding.
		const ciphertext = Buffer.from(
			'68C272ACF16BE005A361DB1C147CA3AD',
			'hex',
		);
		aes.key = Buffer.from(
			'3279CE2E9669A54E038AA62818672150D0B5A13F6757C27F378115501F83B119',
			'hex',
		);
		aes.iv = Buffer.alloc(16);
		aes.padding = PaddingMode.PKCS7;
		aes.mode = 'cfb';
		aes.feedbackSize = 8;

		const transform = aes.createDecryptor();
		const decrypted = transform.transformFinalBlock(
			ciphertext,
			0,
			ciphertext.length,
		);
		expect(decrypted.equals(Buffer.from([1, 2, 3, 4, 5]))).toBe(true);
	});
});
