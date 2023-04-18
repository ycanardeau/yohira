import { using } from '@yohira/base';
import { Aes, PaddingMode } from '@yohira/cryptography';
import { expect, test } from 'vitest';

import { decrypt, encrypt } from './CryptoUtils';

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/PaddingModeTests.cs#L122
function validatePKCS7Padding(
	buffer: Buffer,
	expectedPaddingSize: number,
): void {
	for (
		let i = buffer.length - 1;
		i > buffer.length - 1 - expectedPaddingSize;
		i--
	) {
		expect(buffer[i]).toBe(expectedPaddingSize);
	}
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/PaddingModeTests.cs#L130
function validateANSIX923Padding(
	buffer: Buffer,
	expectedPaddingSize: number,
): void {
	expect(buffer[buffer.length - 1]).toBe(expectedPaddingSize);

	for (
		let i = buffer.length - expectedPaddingSize;
		i < buffer.length - 1;
		i++
	) {
		expect(buffer[i]).toBe(0);
	}
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/PaddingModeTests.cs#L140
function validateISO10126Padding(
	buffer: Buffer,
	expectedPaddingSize: number,
): void {
	// there is nothing else to validate as all the other padding bytes are random.
	expect(buffer[buffer.length - 1]).toBe(expectedPaddingSize);
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/PaddingModeTests.cs#L114
function validateZerosPadding(
	buffer: Buffer,
	expectedPaddingSize: number,
): void {
	for (
		let i = buffer.length - 1;
		i > buffer.length - 1 - expectedPaddingSize;
		i--
	) {
		expect(buffer[i]).toBe(0);
	}
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/PaddingModeTests.cs#L91
function validatePadding(
	buffer: Buffer,
	paddingMode: PaddingMode,
	expectedPaddingSize: number,
): void {
	switch (paddingMode) {
		case PaddingMode.PKCS7:
			validatePKCS7Padding(buffer, expectedPaddingSize);
			break;
		case PaddingMode.ANSIX923:
			validateANSIX923Padding(buffer, expectedPaddingSize);
			break;
		case PaddingMode.ISO10126:
			validateISO10126Padding(buffer, expectedPaddingSize);
			break;
		case PaddingMode.Zeros:
			validateZerosPadding(buffer, expectedPaddingSize);
			break;
		case PaddingMode.None:
			break;
		default:
			break;
	}
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/PaddingModeTests.cs#L26
test('ValidatePaddingMode_NonISO10126', () => {
	function ValidatePaddingMode_NonISO10126(
		paddingMode: PaddingMode,
		expectedPaddingSize: number,
		plainTextStr: string,
		expectedCipherStr: string,
	): void {
		expect(paddingMode !== PaddingMode.ISO10126).toBe(true);

		const key = Buffer.from(
			'1ed2f625c187b993256a8b3ccf9dcbfa5b44b4795c731012f70e4e64732efd5d',
			'hex',
		);
		const iv = Buffer.from('47d1e060ba3c8643f9f8b65feeda4b30', 'hex');

		const plainText = Buffer.from(plainTextStr, 'hex');

		using(Aes.create(), (a) => {
			a.key = key;
			a.iv = iv;
			a.mode = 'cbc';
			a.padding = paddingMode;

			const cipher = encrypt(a, plainText);

			expect(cipher.toString('hex').toUpperCase()).toBe(
				expectedCipherStr,
			);

			// decrypt it with PaddingMode.None so that we can inspect the padding manually
			a.padding = PaddingMode.None;
			const decrypted = decrypt(a, cipher);
			validatePadding(decrypted, paddingMode, expectedPaddingSize);
		});
	}

	ValidatePaddingMode_NonISO10126(PaddingMode.Zeros, 0, '', ''); // no block is added in this case!
	ValidatePaddingMode_NonISO10126(
		PaddingMode.Zeros,
		1,
		'46785BDE46622B92FF7C8EBB91508A',
		'1BE8AA365A15D11FC7826B3A10602D09',
	);
	ValidatePaddingMode_NonISO10126(
		PaddingMode.Zeros,
		13,
		'E505A2',
		'0A2E62938B03E5822EE251117A4CE066',
	);
	ValidatePaddingMode_NonISO10126(
		PaddingMode.PKCS7,
		1,
		'46785BDE46622B92FF7C8EBB91508A',
		'DB5B7829CCE732BFE609140CF45A8843',
	);
	ValidatePaddingMode_NonISO10126(
		PaddingMode.PKCS7,
		13,
		'E505A2',
		'46785BDE46622B92FF7C8EBB91508A4D',
	);
	ValidatePaddingMode_NonISO10126(
		PaddingMode.PKCS7,
		16,
		'',
		'D5450767BCC31793FE5065251B96B715',
	);
	ValidatePaddingMode_NonISO10126(
		PaddingMode.ANSIX923,
		1,
		'46785BDE46622B92FF7C8EBB91508A',
		'DB5B7829CCE732BFE609140CF45A8843',
	);
	ValidatePaddingMode_NonISO10126(
		PaddingMode.ANSIX923,
		13,
		'E505A2',
		'43B27D41A9FDE73CA5DB22C0FDA76CB1',
	);
	ValidatePaddingMode_NonISO10126(
		PaddingMode.ANSIX923,
		16,
		'',
		'A3D32A3A9DCA71B6F961F5A8ED7E414F',
	);
});

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/PaddingModeTests.cs#L57
test('ValidatePaddingMode_ISO10126', () => {
	function ValidatePaddingMode_ISO10126(
		expectedPaddingSize: number,
		plainTextStr: string,
	): void {
		const key = Buffer.from(
			'1ed2f625c187b993256a8b3ccf9dcbfa5b44b4795c731012f70e4e64732efd5d',
			'hex',
		);
		const iv = Buffer.from('47d1e060ba3c8643f9f8b65feeda4b30', 'hex');

		const plainText = Buffer.from(plainTextStr, 'hex');

		using(Aes.create(), (a) => {
			a.key = key;
			a.iv = iv;
			a.mode = 'cbc';
			a.padding = PaddingMode.ISO10126;

			// for ISO10126 we are going to encrypt it twice and assert that the ciphers produced are going to be different
			const cipher = encrypt(a, plainText);
			const secondCipher = encrypt(a, plainText);

			// decrypt it with PaddingMode.None so that we can inspect the padding manually
			a.padding = PaddingMode.None;
			const decrypted = decrypt(a, cipher);

			if (expectedPaddingSize >= 5) {
				const secondDecrypted = decrypt(a, secondCipher);

				// after we decrypted, the two ciphers are going to be different
				expect(secondDecrypted.toString('hex')).not.toBe(
					decrypted.toString('hex'),
				);
			}

			validatePadding(
				decrypted,
				PaddingMode.ISO10126,
				expectedPaddingSize,
			);
		});
	}

	ValidatePaddingMode_ISO10126(1, '46785BDE46622B92FF7C8EBB91508A');
	ValidatePaddingMode_ISO10126(13, 'E505A2');
	ValidatePaddingMode_ISO10126(16, '');
});
