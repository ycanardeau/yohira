import { MemoryStream, using } from '@yohira/base';
import {
	Aes,
	CryptoStream,
	CryptoStreamMode,
	PaddingMode,
} from '@yohira/cryptography';
import { CipherMode } from 'node:crypto';
import { expect, test } from 'vitest';

import { AesFactory } from './AesFactory';

const asciiEncoding: BufferEncoding = 'ascii';
const helloBytes = Buffer.from('Hello', asciiEncoding);

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.Data.cs#L14
// This is the expected output of many decryptions. Changing this value requires re-generating test input.
const multiBlockBytes = Buffer.from(
	'This is a sentence that is longer than a block, it ensures that multi-block functions work.',
	asciiEncoding,
);

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.Data.cs#L18
// A randomly generated 256-bit key.
const aes256Key = Buffer.from([
	0x3e, 0x8a, 0xb2, 0x5b, 0x41, 0xf2, 0x5d, 0xef, 0x48, 0x4e, 0x0c, 0x50,
	0xbb, 0xcf, 0x89, 0xa1, 0x1b, 0x6a, 0x26, 0x86, 0x60, 0x36, 0x7c, 0xfd,
	0x04, 0x3d, 0xe3, 0x97, 0x6d, 0xb0, 0x86, 0x60,
]);

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.Data.cs#L27
// A randomly generated IV, for use in the AES-256CBC tests (and other cases' negative tests)
const aes256CbcIv = Buffer.from([
	0x43, 0x20, 0xc3, 0xe1, 0xca, 0x80, 0x0c, 0xd1, 0xdb, 0x74, 0xf7, 0x30,
	0x6d, 0xed, 0x40, 0xf7,
]);

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.Data.cs#L34
// A randomly generated 192-bit key.
/* TODO: const aes192Key = Buffer.from([
	0xa6, 0x1e, 0xc7, 0x54, 0x37, 0x4d, 0x8c, 0xa5, 0xa4, 0xbb, 0x99, 0x50,
	0x35, 0x4b, 0x30, 0x4d, 0x6c, 0xfe, 0x3b, 0x59, 0x65, 0xcb, 0x93, 0xe3,
]); */

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.Data.cs#L42
// A randomly generated 128-bit key.
/* TODO: const aes128Key = Buffer.from([
	0x8b, 0x74, 0xcf, 0x71, 0x34, 0x99, 0x97, 0x68, 0x22, 0x86, 0xe7, 0x52,
	0xed, 0xfc, 0x56, 0x7e,
]); */

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L1045
function RandomKeyRoundtrip(aes: Aes): void {
	const encryptedBytes = using(
		MemoryStream.from(multiBlockBytes, 0, multiBlockBytes.length),
		(input) => {
			return using(aes.createEncryptor(), (encryptor) => {
				return using(
					new CryptoStream(input, encryptor, CryptoStreamMode.Read),
					(cryptoStream) => {
						return using(MemoryStream.alloc(0), (output) => {
							cryptoStream.copyTo(output);
							return output.toBuffer();
						});
					},
				);
			});
		},
	);

	expect(encryptedBytes.equals(multiBlockBytes)).toBe(false);

	const decryptedBytes = using(
		MemoryStream.from(encryptedBytes, 0, encryptedBytes.length),
		(input) => {
			return using(aes.createDecryptor(), (decryptor) => {
				return using(
					new CryptoStream(input, decryptor, CryptoStreamMode.Read),
					(cryptoStream) => {
						return using(MemoryStream.alloc(), (output) => {
							cryptoStream.copyTo(output);
							return output.toBuffer();
						});
					},
				);
			});
		},
	);

	expect(decryptedBytes.equals(multiBlockBytes)).toBe(true);
}

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L1073
function testAesDecrypt(
	mode: CipherMode,
	key: Buffer,
	iv: Buffer,
	encryptedBytes: Buffer,
	expectedAnswer: Buffer,
	feedbackSize?: number,
): void {
	using(AesFactory.create(), (aes) => {
		aes.mode = mode;
		aes.key = key;

		if (feedbackSize !== undefined) {
			aes.feedbackSize = feedbackSize;
		}

		if (iv !== undefined) {
			aes.iv = iv;
		}

		const [decryptedBytes, oneShotDecryptedBytes] = using(
			MemoryStream.from(encryptedBytes, 0, encryptedBytes.length),
			(input) => {
				return using(aes.createDecryptor(), (decryptor) => {
					return using(
						new CryptoStream(
							input,
							decryptor,
							CryptoStreamMode.Read,
						),
						(cryptoStream) => {
							return using(MemoryStream.alloc(), (output) => {
								cryptoStream.copyTo(output);
								return [
									output.toBuffer(),
									undefined /* TODO */,
								];
							});
						},
					);
				});
			},
		);

		expect(decryptedBytes.equals(encryptedBytes)).toBe(false);
		expect(decryptedBytes.equals(expectedAnswer)).toBe(true);

		if (oneShotDecryptedBytes !== undefined) {
			expect(oneShotDecryptedBytes).toBe(expectedAnswer);
		}
	});
}

function AesEncryptDirectKey(
	aes: Aes,
	key: Buffer,
	iv: Buffer | undefined,
	plainBytes: Buffer,
): Buffer {
	return using(MemoryStream.alloc(), (output) => {
		return using(aes.createEncryptorCore(key, iv), (encryptor) => {
			return using(
				new CryptoStream(output, encryptor, CryptoStreamMode.Write),
				(cryptoStream) => {
					cryptoStream.write(plainBytes, 0, plainBytes.length);
					cryptoStream.flushFinalBlock();

					return output.toBuffer();
				},
			);
		});
	});
}

function AesDecryptDirectKey(
	aes: Aes,
	key: Buffer,
	iv: Buffer | undefined,
	cipherBytes: Buffer,
): Buffer {
	return using(MemoryStream.alloc(0), (output) => {
		return using(aes.createDecryptorCore(key, iv), (decryptor) => {
			return using(
				new CryptoStream(output, decryptor, CryptoStreamMode.Write),
				(cryptoStream) => {
					cryptoStream.write(cipherBytes, 0, cipherBytes.length);
					cryptoStream.flushFinalBlock();

					return output.toBuffer();
				},
			);
		});
	});
}

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L1123
function TestAesTransformDirectKey(
	cipherMode: CipherMode,
	paddingMode: PaddingMode,
	key: Buffer,
	iv: Buffer | undefined,
	plainBytes: Buffer,
	cipherBytes: Buffer,
	feedbackSize?: number,
): void {
	const [liveEncryptBytes, liveDecryptBytes] = using(
		AesFactory.create(),
		(aes) => {
			aes.mode = cipherMode;
			aes.padding = paddingMode;
			aes.key = key;

			if (feedbackSize !== undefined) {
				aes.feedbackSize = feedbackSize;
			}

			const liveEncryptBytes = AesEncryptDirectKey(
				aes,
				key,
				iv,
				plainBytes,
			);
			const liveDecryptBytes = AesDecryptDirectKey(
				aes,
				key,
				iv,
				cipherBytes,
			);

			// TODO

			return [liveEncryptBytes, liveDecryptBytes];
		},
	);

	expect(liveEncryptBytes.equals(cipherBytes)).toBe(true);
	expect(liveDecryptBytes.equals(plainBytes)).toBe(true);
}

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L18
test('RandomKeyRoundtrip_Default', () => {
	using(AesFactory.create(), (aes) => {
		RandomKeyRoundtrip(aes);
	});
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L38
test('RandomKeyRoundtrip_192', () => {
	using(AesFactory.create(), (aes) => {
		aes.keySize = 192;

		RandomKeyRoundtrip(aes);
	});
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L49
test('RandomKeyRoundtrip_256', () => {
	using(AesFactory.create(), (aes) => {
		aes.keySize = 256;

		RandomKeyRoundtrip(aes);
	});
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L60
test('DecryptKnownCBC256', () => {
	const encryptedBytes = Buffer.from([
		0x6c, 0xbc, 0xe1, 0xaf, 0x8a, 0xac, 0xe0, 0xa2, 0x2e, 0xad, 0xb2, 0x9c,
		0x28, 0x40, 0x72, 0x72, 0xae, 0x38, 0xfd, 0xa0, 0xe9, 0xe0, 0xe6, 0xd3,
		0x28, 0xfb, 0xbf, 0x21, 0xde, 0xcc, 0xcc, 0x22, 0x31, 0x46, 0x35, 0xf4,
		0x18, 0xe9, 0x01, 0x98, 0xf0, 0x6f, 0x35, 0x3f, 0xa4, 0x61, 0x3d, 0x4a,
		0x20, 0x27, 0xb4, 0xca, 0x67, 0x31, 0x0d, 0x38, 0x49, 0x0d, 0xce, 0xd5,
		0x92, 0x3a, 0x78, 0x77, 0x00, 0x5e, 0xf9, 0x60, 0xe3, 0x10, 0x8d, 0x14,
		0x8f, 0xdc, 0x68, 0x80, 0x0d, 0xec, 0xfa, 0x5f, 0x19, 0xfe, 0x8e, 0x94,
		0x57, 0x87, 0x2b, 0xed, 0x08, 0x0f, 0xb4, 0x99, 0x0d, 0x1a, 0xe1, 0x41,
	]);

	testAesDecrypt(
		'cbc',
		aes256Key,
		aes256CbcIv,
		encryptedBytes,
		multiBlockBytes,
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L104
/* TODO: test('DecryptKnownECB192', () => {
	const encryptedBytes = Buffer.from([
		0xc9, 0x7f, 0xa5, 0x5b, 0xc3, 0x92, 0xdc, 0xa6, 0xe4, 0x9f, 0x2d, 0x1a,
		0xef, 0x7a, 0x27, 0x03, 0x04, 0x9c, 0xfb, 0x56, 0x63, 0x38, 0xae, 0x4f,
		0xdc, 0xf6, 0x36, 0x98, 0x28, 0x05, 0x32, 0xe9, 0xf2, 0x6e, 0xec, 0x0c,
		0x04, 0x9d, 0x12, 0x17, 0x18, 0x35, 0xd4, 0x29, 0xfc, 0x01, 0xb1, 0x20,
		0xfa, 0x30, 0xae, 0x00, 0x53, 0xd4, 0x26, 0x25, 0xa4, 0xfd, 0xd5, 0xe6,
		0xed, 0x79, 0x35, 0x2a, 0xe2, 0xbb, 0x95, 0x0d, 0xef, 0x09, 0xbb, 0x6d,
		0xc5, 0xc4, 0xdb, 0x28, 0xc6, 0xf4, 0x31, 0x33, 0x9a, 0x90, 0x12, 0x36,
		0x50, 0xa0, 0xb7, 0xd1, 0x35, 0xc4, 0xce, 0x81, 0xe5, 0x2b, 0x85, 0x6b,
	]);

	testAesDecrypt(
		'ecb',
		aes192Key,
		undefined,
		encryptedBytes,
		multiBlockBytes,
	);
}); */

// TODO

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L170
test('VerifyInPlaceEncryption', () => {
	const expectedCipherText = Buffer.from([
		0x08, 0x58, 0x26, 0x94, 0xf3, 0x4f, 0x7f, 0xc9, 0x0a, 0x59, 0x1a, 0x51,
		0xa6, 0x56, 0x97, 0x4e, 0x95, 0x07, 0x1a, 0x94, 0x0e, 0x53, 0x8d, 0x8a,
		0x48, 0xb4, 0x30, 0x6b, 0x08, 0xe0, 0x89, 0x3b,
	]);

	using(AesFactory.create(), (aes) => {
		aes.mode = 'cbc';
		aes.padding = PaddingMode.None;

		aes.key = Buffer.from([
			0x00, 0x04, 0x08, 0x0c, 0x10, 0x14, 0x18, 0x1c, 0x20, 0x24, 0x28,
			0x2c, 0x30, 0x34, 0x38, 0x3c, 0x40, 0x44, 0x48, 0x4c, 0x50, 0x54,
			0x58, 0x5c, 0x60, 0x64, 0x68, 0x6c, 0x70, 0x74, 0x78, 0x7c,
		]);

		aes.iv = Buffer.from([
			0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75,
		]);

		// buffer[1 .. Length-1] is "input" (all zeroes)
		// buffer[0 .. Length-2] is "output"
		const buffer = Buffer.alloc(expectedCipherText.length + 1);
		const bytesWritten = using(aes.createEncryptor(), (encryptor) => {
			return encryptor.transformBlock(
				buffer,
				1,
				expectedCipherText.length,
				buffer,
				0,
			);
		});

		// Most implementations of AES would be expected to return expectedCipherText.Length here,
		// because AES encryption doesn't have to hold back a block in case it was the final, padded block.
		//
		// But, there's nothing in AES that requires this to be true. An implementation could exist
		// that saves up all of the data from TransformBlock and waits until TransformFinalBlock to give
		// anything back. Or encrypt could also hold one block in reserve. Or any other reason.
		//
		// But, if TransformBlock writes non-zero bytes, they should be correct, even when writing back
		// to the same array that was originally input.

		let expectedSlice = expectedCipherText;

		if (bytesWritten !== expectedCipherText.length) {
			expectedSlice = Buffer.alloc(bytesWritten);
			expectedCipherText.copy(expectedSlice, 0, 0, bytesWritten);
		}

		const actualCipherText = Buffer.alloc(bytesWritten);
		buffer.copy(actualCipherText, 0, 0, bytesWritten);

		expect(actualCipherText.equals(expectedCipherText)).toBe(true);
	});
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L231
test('VerifyInPlaceDecryption', () => {
	const key = Buffer.from(
		'1ed2f625c187b993256a8b3ccf9dcbfa5b44b4795c731012f70e4e64732efd5d',
		'hex',
	);
	const iv = Buffer.from('47d1e060ba3c8643f9f8b65feeda4b30', 'hex');
	const plainText = Buffer.from(
		'f238882f6530ae9191c294868feed0b0df4058b322377dec14690c3b6bbf6ad1dd5b7c063a28e2cca2a6dce8cc2e668ea6ce80cee4c1a1a955ff46c530f3801b',
		'hex',
	);
	const cipher = Buffer.from(
		'7c6e1bcd3c30d2fb2d92e3346048307dc6719a6b96a945b4d987af09469ec68f5ca535fab7f596fffa80f7cfaeb26eefaf8d4ca8be190393b2569249d673f042',
		'hex',
	);

	using(AesFactory.create(), (a) => {
		using(MemoryStream.from(cipher, 0, cipher.length), (cipherStream) => {
			a.key = key;
			a.iv = iv;
			a.mode = 'cbc';
			a.padding = PaddingMode.None;

			const blockSizeBytes = Math.floor(a.blockSize / 8);
			const decrypted: Buffer[] = [];

			using(a.createDecryptor(), (decryptor) => {
				while (true) {
					const buffer = Buffer.alloc(blockSizeBytes);
					const numRead = cipherStream.read(
						buffer,
						0,
						blockSizeBytes,
					);

					if (numRead === 0) {
						break;
					}

					expect(numRead).toBe(blockSizeBytes);
					decryptor.transformBlock(
						buffer,
						0,
						blockSizeBytes,
						buffer,
						0,
					);
					decrypted.push(buffer);
				}

				decrypted.push(
					decryptor.transformFinalBlock(Buffer.alloc(0), 0, 0),
				);

				expect(Buffer.concat(decrypted).equals(plainText)).toBe(true);
			});
		});
	});
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L275
test('VerifyKnownTransform_ECB128_NoPadding', () => {
	TestAesTransformDirectKey(
		'ecb',
		PaddingMode.None,
		Buffer.from([
			0x00, 0x01, 0x02, 0x03, 0x05, 0x06, 0x07, 0x08, 0x0a, 0x0b, 0x0c,
			0x0d, 0x0f, 0x10, 0x11, 0x12,
		]),
		undefined,
		Buffer.from([
			0x50, 0x68, 0x12, 0xa4, 0x5f, 0x08, 0xc8, 0x89, 0xb9, 0x7f, 0x59,
			0x80, 0x03, 0x8b, 0x83, 0x59,
		]),
		Buffer.from([
			0xd8, 0xf5, 0x32, 0x53, 0x82, 0x89, 0xef, 0x7d, 0x06, 0xb5, 0x06,
			0xa4, 0xfd, 0x5b, 0xe9, 0xc9,
		]),
	);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L287
test('VerifyKnownTransform_ECB256_NoPadding', () => {
	TestAesTransformDirectKey(
		'ecb',
		PaddingMode.None,
		Buffer.from([
			0x00, 0x01, 0x02, 0x03, 0x05, 0x06, 0x07, 0x08, 0x0a, 0x0b, 0x0c,
			0x0d, 0x0f, 0x10, 0x11, 0x12, 0x14, 0x15, 0x16, 0x17, 0x19, 0x1a,
			0x1b, 0x1c, 0x1e, 0x1f, 0x20, 0x21, 0x23, 0x24, 0x25, 0x26,
		]),
		undefined,
		Buffer.from([
			0x83, 0x4e, 0xad, 0xfc, 0xca, 0xc7, 0xe1, 0xb3, 0x06, 0x64, 0xb1,
			0xab, 0xa4, 0x48, 0x15, 0xab,
		]),
		Buffer.from([
			0x19, 0x46, 0xda, 0xbf, 0x6a, 0x03, 0xa2, 0xa2, 0xc3, 0xd0, 0xb0,
			0x50, 0x80, 0xae, 0xd6, 0xfc,
		]),
	);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L299
test('VerifyKnownTransform_ECB128_NoPadding_2', () => {
	TestAesTransformDirectKey(
		'ecb',
		PaddingMode.None,
		Buffer.from([0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		undefined,
		Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([
			0x0e, 0xdd, 0x33, 0xd3, 0xc6, 0x21, 0xe5, 0x46, 0x45, 0x5b, 0xd8,
			0xba, 0x14, 0x18, 0xbe, 0xc8,
		]),
	);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L311
test('VerifyKnownTransform_ECB128_NoPadding_3', () => {
	TestAesTransformDirectKey(
		'ecb',
		PaddingMode.None,
		Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		undefined,
		Buffer.from([0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([
			0x3a, 0xd7, 0x8e, 0x72, 0x6c, 0x1e, 0xc0, 0x2b, 0x7e, 0xbf, 0xe9,
			0x2b, 0x23, 0xd9, 0xec, 0x34,
		]),
	);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L323
test('VerifyKnownTransform_ECB192_NoPadding', () => {
	TestAesTransformDirectKey(
		'ecb',
		PaddingMode.None,
		Buffer.from([
			0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0,
		]),
		undefined,
		Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([
			0xde, 0x88, 0x5d, 0xc8, 0x7f, 0x5a, 0x92, 0x59, 0x40, 0x82, 0xd0,
			0x2c, 0xc1, 0xe1, 0xb4, 0x2c,
		]),
	);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L335
test('VerifyKnownTransform_ECB192_NoPadding_2', () => {
	TestAesTransformDirectKey(
		'ecb',
		PaddingMode.None,
		Buffer.from([
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0,
		]),
		undefined,
		Buffer.from([0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([
			0x6c, 0xd0, 0x25, 0x13, 0xe8, 0xd4, 0xdc, 0x98, 0x6b, 0x4a, 0xfe,
			0x08, 0x7a, 0x60, 0xbd, 0x0c,
		]),
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L373
test('VerifyKnownTransform_CBC128_NoPadding', () => {
	TestAesTransformDirectKey(
		'cbc',
		PaddingMode.None,
		Buffer.from([
			0x00, 0x01, 0x02, 0x03, 0x05, 0x06, 0x07, 0x08, 0x0a, 0x0b, 0x0c,
			0x0d, 0x0f, 0x10, 0x11, 0x12,
		]),
		Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([
			0x50, 0x68, 0x12, 0xa4, 0x5f, 0x08, 0xc8, 0x89, 0xb9, 0x7f, 0x59,
			0x80, 0x03, 0x8b, 0x83, 0x59,
		]),
		Buffer.from([
			0xd8, 0xf5, 0x32, 0x53, 0x82, 0x89, 0xef, 0x7d, 0x06, 0xb5, 0x06,
			0xa4, 0xfd, 0x5b, 0xe9, 0xc9,
		]),
	);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L385
test('VerifyKnownTransform_CBC256_NoPadding', () => {
	TestAesTransformDirectKey(
		'cbc',
		PaddingMode.None,
		Buffer.from([
			0x00, 0x01, 0x02, 0x03, 0x05, 0x06, 0x07, 0x08, 0x0a, 0x0b, 0x0c,
			0x0d, 0x0f, 0x10, 0x11, 0x12, 0x14, 0x15, 0x16, 0x17, 0x19, 0x1a,
			0x1b, 0x1c, 0x1e, 0x1f, 0x20, 0x21, 0x23, 0x24, 0x25, 0x26,
		]),
		Buffer.from([
			0x83, 0x4e, 0xad, 0xfc, 0xca, 0xc7, 0xe1, 0xb3, 0x06, 0x64, 0xb1,
			0xab, 0xa4, 0x48, 0x15, 0xab,
		]),
		Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([
			0x19, 0x46, 0xda, 0xbf, 0x6a, 0x03, 0xa2, 0xa2, 0xc3, 0xd0, 0xb0,
			0x50, 0x80, 0xae, 0xd6, 0xfc,
		]),
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L410
test('VerifyKnownTransform_CFB8_256_NoPadding', () => {
	TestAesTransformDirectKey(
		'cfb',
		PaddingMode.None,
		Buffer.from([
			0x00, 0x01, 0x02, 0x03, 0x05, 0x06, 0x07, 0x08, 0x0a, 0x0b, 0x0c,
			0x0d, 0x0f, 0x10, 0x11, 0x12, 0x14, 0x15, 0x16, 0x17, 0x19, 0x1a,
			0x1b, 0x1c, 0x1e, 0x1f, 0x20, 0x21, 0x23, 0x24, 0x25, 0x26,
		]),
		Buffer.from([
			0x83, 0x4e, 0xad, 0xfc, 0xca, 0xc7, 0xe1, 0xb3, 0x06, 0x64, 0xb1,
			0xab, 0xa4, 0x48, 0x15, 0xab,
		]),
		Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([
			0x19, 0x38, 0x0a, 0x23, 0x92, 0x37, 0xc2, 0x7a, 0xba, 0xd1, 0x82,
			0x62, 0xe0, 0x36, 0x83, 0x0c,
		]),
		8,
	);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L423
test('VerifyKnownTransform_CBC128_NoPadding_2', () => {
	TestAesTransformDirectKey(
		'cbc',
		PaddingMode.None,
		Buffer.from([0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6]),
		Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6]),
		Buffer.from([
			0x0e, 0xdd, 0x33, 0xd3, 0xc6, 0x21, 0xe5, 0x46, 0x45, 0x5b, 0xd8,
			0xba, 0x14, 0x18, 0xbe, 0xc8,
		]),
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L448
test('VerifyKnownTransform_CBC128_NoPadding_3', () => {
	TestAesTransformDirectKey(
		'cbc',
		PaddingMode.None,
		Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([0x90, 5, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([0x10, 5, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([
			0x3a, 0xd7, 0x8e, 0x72, 0x6c, 0x1e, 0xc0, 0x2b, 0x7e, 0xbf, 0xe9,
			0x2b, 0x23, 0xd9, 0xec, 0x34,
		]),
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L473
test('VerifyKnownTransform_CBC192_NoPadding', () => {
	TestAesTransformDirectKey(
		'cbc',
		PaddingMode.None,
		Buffer.from([
			0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0,
		]),
		Buffer.from([
			255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
			255, 255, 255,
		]),
		Buffer.from([
			255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
			255, 255, 255,
		]),
		Buffer.from([
			0xde, 0x88, 0x5d, 0xc8, 0x7f, 0x5a, 0x92, 0x59, 0x40, 0x82, 0xd0,
			0x2c, 0xc1, 0xe1, 0xb4, 0x2c,
		]),
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L498
test('VerifyKnownTransform_CFB8_192_NoPadding', () => {
	TestAesTransformDirectKey(
		'cfb',
		PaddingMode.None,
		Buffer.from([
			0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0,
		]),
		Buffer.from([
			255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
			255, 255, 255,
		]),
		Buffer.from([
			255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
			255, 255, 255,
		]),
		Buffer.from([
			0xe9, 0x3e, 0xe5, 0xbf, 0x29, 0xff, 0x95, 0x6e, 0x6b, 0xd6, 0xe8,
			0x6f, 0x9f, 0x6a, 0x05, 0x62,
		]),
		8,
	);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L511
test('VerifyKnownTransform_CBC192_NoPadding_2', () => {
	TestAesTransformDirectKey(
		'cbc',
		PaddingMode.None,
		Buffer.from([
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0,
		]),
		Buffer.from([0x81, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([0x01, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		Buffer.from([
			0x6c, 0xd0, 0x25, 0x13, 0xe8, 0xd4, 0xdc, 0x98, 0x6b, 0x4a, 0xfe,
			0x08, 0x7a, 0x60, 0xbd, 0x0c,
		]),
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L632
test('VerifyKnownTransform_CFB8_128_NoPadding_4', () => {
	// NIST CAVP AESMMT.ZIP CFB8MMT128.rsp, [ENCRYPT] COUNT=4
	// plaintext not extended
	TestAesTransformDirectKey(
		'cfb',
		PaddingMode.None,
		Buffer.from('5d5e7f20e0a66d3e09e0e5a9912f8a46', 'hex'),
		Buffer.from('052d7ea0ad1f2956a23b27afe1d87b6b', 'hex'),
		Buffer.from('b84a90fc6d', 'hex'),
		Buffer.from('1a9a61c307', 'hex'),
		8,
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L675
test('VerifyKnownTransform_CFB8_128_PKCS7_4', () => {
	TestAesTransformDirectKey(
		'cfb',
		PaddingMode.PKCS7,
		Buffer.from('5d5e7f20e0a66d3e09e0e5a9912f8a46', 'hex'),
		Buffer.from('052d7ea0ad1f2956a23b27afe1d87b6b', 'hex'),
		Buffer.from('b84a90fc6d', 'hex'),
		Buffer.from('1a9a61c307a4', 'hex'),
		8,
	);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L690
test('VerifyKnownTransform_CFB8_128_NoOrZeroPadding_0_Extended', () => {
	function VerifyKnownTransform_CFB8_128_NoOrZeroPadding_0_Extended(
		paddingMode: PaddingMode,
	): void {
		// NIST CAVP AESMMT.ZIP CFB8MMT128.rsp, [ENCRYPT] COUNT=0
		// plaintext zero-extended to a full block, cipherBytes extended value
		// provided by .NET Framework
		TestAesTransformDirectKey(
			'cfb',
			paddingMode,
			Buffer.from('c57d699d89df7cfbef71c080a6b10ac3', 'hex'),
			Buffer.from('fcb2bc4c006b87483978796a2ae2c42e', 'hex'),
			Buffer.from('61' + '000000000000000000000000000000', 'hex'),
			Buffer.from('24' + 'D89FE413C3D37172D6B577E2F94997', 'hex'),
			8,
		);
	}

	VerifyKnownTransform_CFB8_128_NoOrZeroPadding_0_Extended(PaddingMode.None);
	VerifyKnownTransform_CFB8_128_NoOrZeroPadding_0_Extended(PaddingMode.Zeros);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L708
test('VerifyKnownTransform_CFB8_128_NoOrZeroPadding_9_Extended', () => {
	function VerifyKnownTransform_CFB8_128_NoOrZeroPadding_9_Extended(
		paddingMode: PaddingMode,
	): void {
		// NIST CAVP AESMMT.ZIP CFB8MMT128.rsp, [ENCRYPT] COUNT=9
		// plaintext zero-extended to a full block, cipherBytes extended value
		// provided by .NET Framework
		TestAesTransformDirectKey(
			'cfb',
			paddingMode,
			Buffer.from('3a6f9159263fa6cef2a075caface5817', 'hex'),
			Buffer.from('0fc23662b7dbf73827f0c7de321ca36e', 'hex'),
			Buffer.from('87efeb8d559ed3367728' + '000000000000', 'hex'),
			Buffer.from('8e9c50425614d540ce11' + '7DD85E93D8E0', 'hex'),
			8,
		);
	}

	VerifyKnownTransform_CFB8_128_NoOrZeroPadding_9_Extended(PaddingMode.None);
	VerifyKnownTransform_CFB8_128_NoOrZeroPadding_9_Extended(PaddingMode.Zeros);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L726
test('VerifyKnownTransform_CFB8_192_NoOrZeroPadding_0_Extended', () => {
	function VerifyKnownTransform_CFB8_192_NoOrZeroPadding_0_Extended(
		paddingMode: PaddingMode,
	): void {
		// NIST CAVP AESMMT.ZIP CFB8MMT192.rsp, [ENCRYPT] COUNT=0
		// plaintext zero-extended to a full block, cipherBytes extended value
		// provided by .NET Framework
		TestAesTransformDirectKey(
			'cfb',
			paddingMode,
			Buffer.from(
				'32a1b0e3da368db563d7316b9779d3327e53d9a6d287ed97',
				'hex',
			),
			Buffer.from('3dd0e7e21f09d5842f3a699da9b57346', 'hex'),
			Buffer.from('54' + '000000000000000000000000000000', 'hex'),
			Buffer.from('6d' + 'B3F513638A136D73873517AF1A770F', 'hex'),
			8,
		);
	}

	VerifyKnownTransform_CFB8_192_NoOrZeroPadding_0_Extended(PaddingMode.None);
	VerifyKnownTransform_CFB8_192_NoOrZeroPadding_0_Extended(PaddingMode.Zeros);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L744
test('VerifyKnownTransform_CFB8_192_NoOrZeroPadding_9_Extended', () => {
	function VerifyKnownTransform_CFB8_192_NoOrZeroPadding_9_Extended(
		paddingMode: PaddingMode,
	): void {
		// NIST CAVP AESMMT.ZIP CFB8MMT192.rsp, [ENCRYPT] COUNT=9
		// plaintext zero-extended to a full block, cipherBytes extended value
		// provided by .NET Framework
		TestAesTransformDirectKey(
			'cfb',
			paddingMode,
			Buffer.from(
				'537e7bf661fd4024a024613f15b13690f7d0c847c1e18965',
				'hex',
			),
			Buffer.from('3a81f9d9d3c155b0caad5d73349476fc', 'hex'),
			Buffer.from('d3d8b9b984adc24237ee' + '000000000000', 'hex'),
			Buffer.from('3879fea72ac99929e53a' + '39552A575D73', 'hex'),
			8,
		);
	}

	VerifyKnownTransform_CFB8_192_NoOrZeroPadding_9_Extended(PaddingMode.None);
	VerifyKnownTransform_CFB8_192_NoOrZeroPadding_9_Extended(PaddingMode.Zeros);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L762
test('VerifyKnownTransform_CFB8_256_NoOrZeroPadding_0_Extended', () => {
	function VerifyKnownTransform_CFB8_256_NoOrZeroPadding_0_Extended(
		paddingMode: PaddingMode,
	): void {
		// NIST CAVP AESMMT.ZIP CFB8MMT256.rsp, [ENCRYPT] COUNT=0
		// plaintext zero-extended to a full block, cipherBytes extended value
		// provided by .NET Framework
		TestAesTransformDirectKey(
			'cfb',
			paddingMode,
			Buffer.from(
				'34e8091cee09f1bd3ebf1e8f05f51bfbd4899ef2ae006a3a0f7875052cdd46c8',
				'hex',
			),
			Buffer.from('43eb4dcc4b04a80216a20e4a09a7abb5', 'hex'),
			Buffer.from('f9' + '000000000000000000000000000000', 'hex'),
			Buffer.from('28' + '26199F76D20BE53AB4D146CFC6D281', 'hex'),
			8,
		);
	}

	VerifyKnownTransform_CFB8_256_NoOrZeroPadding_0_Extended(PaddingMode.None);
	VerifyKnownTransform_CFB8_256_NoOrZeroPadding_0_Extended(PaddingMode.Zeros);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L780
test('VerifyKnownTransform_CFB8_256_NoOrZeroPadding_9_Extended', () => {
	function VerifyKnownTransform_CFB8_256_NoOrZeroPadding_9_Extended(
		paddingMode: PaddingMode,
	): void {
		// NIST CAVP AESMMT.ZIP CFB8MMT256.rsp, [ENCRYPT] COUNT=9
		// plaintext zero-extended to a full block, cipherBytes extended value
		// provided by .NET Framework
		TestAesTransformDirectKey(
			'cfb',
			paddingMode,
			Buffer.from(
				'ebbb4566b5e182e0f072466b0b311df38f9175bc0213a5530bce2ec4d74f400d',
				'hex',
			),
			Buffer.from('0956a48e01002c9e16376d6e308dbad1', 'hex'),
			Buffer.from('b0fe25ac8d3d28a2f471' + '000000000000', 'hex'),
			Buffer.from('638c6823e7256fb5626e' + '5EE5C1D7FA17', 'hex'),
			8,
		);
	}

	VerifyKnownTransform_CFB8_256_NoOrZeroPadding_9_Extended(PaddingMode.None);
	VerifyKnownTransform_CFB8_256_NoOrZeroPadding_9_Extended(PaddingMode.Zeros);
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L960
test('AesZeroPad', () => {
	function AesZeroPad(cipherMode: CipherMode): void {
		const [expectedAnswer, decryptedBytes] = using(
			AesFactory.create(),
			(aes) => {
				aes.mode = cipherMode;
				aes.padding = PaddingMode.Zeros;
				aes.feedbackSize = 128;

				const alignBytes = Math.floor(aes.blockSize / 8); // Feedback size is same as block size, both are 128 bits
				const missingBytes =
					alignBytes - (multiBlockBytes.length % alignBytes);

				// Zero-padding doesn't have enough information to remove the trailing zeroes.
				// Therefore we expect the answer of ZeroPad(s_multiBlockBytes).
				// So, make a long enough array, and copy s_multiBlockBytes to the beginning of it.
				const expectedAnswer = Buffer.alloc(
					multiBlockBytes.length + missingBytes,
				);
				multiBlockBytes.copy(
					expectedAnswer,
					0,
					0,
					multiBlockBytes.length,
				);

				const encryptedBytes = using(
					MemoryStream.from(
						multiBlockBytes,
						0,
						multiBlockBytes.length,
					),
					(input) => {
						return using(aes.createEncryptor(), (encryptor) => {
							return using(
								new CryptoStream(
									input,
									encryptor,
									CryptoStreamMode.Read,
								),
								(cryptoStream) => {
									return using(
										MemoryStream.alloc(0),
										(output) => {
											cryptoStream.copyTo(output);
											return output.toBuffer();
										},
									);
								},
							);
						});
					},
				);

				const decryptedBytes = using(
					MemoryStream.from(encryptedBytes, 0, encryptedBytes.length),
					(input) => {
						return using(aes.createDecryptor(), (decryptor) => {
							return using(
								new CryptoStream(
									input,
									decryptor,
									CryptoStreamMode.Read,
								),
								(cryptoStream) => {
									return using(
										MemoryStream.alloc(),
										(output) => {
											cryptoStream.copyTo(output);
											return output.toBuffer();
										},
									);
								},
							);
						});
					},
				);

				return [expectedAnswer, decryptedBytes];
			},
		);

		expect(decryptedBytes.equals(expectedAnswer)).toBe(true);
	}

	AesZeroPad('cbc');
	// TODO: AesZeroPad('cfb');
});

// https://github.com/dotnet/runtime/blob/2f18320e731cc3b06bc43cdb4d82dffc4f8f81fc/src/libraries/Common/tests/System/Security/Cryptography/AlgorithmImplementations/AES/AesCipherTests.cs#L1005
test('StableEncryptDecrypt', () => {
	const [encrypted, encrypted2, decrypted, decrypted2] = using(
		AesFactory.create(),
		(aes) => {
			aes.mode = 'cbc';
			aes.key = aes256Key;
			aes.iv = aes256CbcIv;

			const encrypted = using(aes.createEncryptor(), (encryptor) => {
				return encryptor.transformFinalBlock(
					helloBytes,
					0,
					helloBytes.length,
				);
			});

			// Use a new encryptor for encrypted2 so that this test doesn't depend on CanReuseTransform
			const encrypted2 = using(aes.createEncryptor(), (encryptor) => {
				return encryptor.transformFinalBlock(
					helloBytes,
					0,
					helloBytes.length,
				);
			});

			const decrypted = using(aes.createDecryptor(), (decryptor) => {
				return decryptor.transformFinalBlock(
					encrypted,
					0,
					encrypted.length,
				);
			});

			const decrypted2 = using(aes.createDecryptor(), (decryptor) => {
				return decryptor.transformFinalBlock(
					encrypted2,
					0,
					encrypted2.length,
				);
			});

			return [encrypted, encrypted2, decrypted, decrypted2];
		},
	);

	expect(encrypted2.equals(encrypted)).toBe(true);
	expect(decrypted2.equals(decrypted)).toBe(true);
	expect(decrypted.equals(helloBytes)).toBe(true);
});

// TODO
