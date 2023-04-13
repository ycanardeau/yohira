import { Aes, HMACSHA256 } from '@yohira/cryptography';
import { ManagedAuthenticatedEncryptor, Secret } from '@yohira/data-protection';
import { expect, test } from 'vitest';

import { SequentialGenRandom } from '../SequentialGenRandom';

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/Managed/ManagedAuthenticatedEncryptorTests.cs#L12
test('Encrypt_Decrypt_RoundTrips', () => {
	const kdk = new Secret(Buffer.alloc(512 / 8));
	const encryptor = new ManagedAuthenticatedEncryptor(
		kdk,
		Aes.create,
		256 / 8,
		() => new HMACSHA256(),
	);
	const plaintext = Buffer.from('plaintext');
	const aad = Buffer.from('aad');

	const ciphertext = encryptor.encrypt(plaintext, aad);
	const decipheredtext = encryptor.decrypt(Buffer.from(ciphertext), aad);

	expect(decipheredtext.equals(plaintext)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/Managed/ManagedAuthenticatedEncryptorTests.cs#L32
test('Encrypt_Decrypt_Tampering_Fails', () => {
	const kdk = new Secret(Buffer.alloc(512 / 8));
	const encryptor = new ManagedAuthenticatedEncryptor(
		kdk,
		Aes.create,
		256 / 8,
		() => new HMACSHA256(),
	);
	const plaintext = Buffer.from('plaintext');
	const aad = Buffer.from('aad');
	const validCiphertext = encryptor.encrypt(plaintext, aad);

	// Ciphertext is too short to be a valid payload
	const invalidCiphertext_tooShort = Buffer.alloc(10);
	expect(() =>
		encryptor.decrypt(Buffer.from(invalidCiphertext_tooShort), aad),
	).toThrowError('The payload was invalid.');

	// Ciphertext has been manipulated
	const invalidCiphertext_manipulated = Buffer.from(validCiphertext);
	invalidCiphertext_manipulated[0] ^= 0x01;
	expect(() =>
		encryptor.decrypt(Buffer.from(invalidCiphertext_manipulated), aad),
	).toThrowError('An error occurred during a cryptographic operation.');

	// Ciphertext is too long
	const invalidCiphertext_tooLong = Buffer.concat([
		validCiphertext,
		Buffer.from([0]),
	]);
	expect(() =>
		encryptor.decrypt(Buffer.from(invalidCiphertext_tooLong), aad),
	).toThrowError('An error occurred during a cryptographic operation.');

	// AAD is incorrect
	expect(() =>
		encryptor.decrypt(
			Buffer.from(validCiphertext),
			Buffer.from('different aad'),
		),
	).toThrowError('An error occurred during a cryptographic operation.');
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/Managed/ManagedAuthenticatedEncryptorTests.cs#L78
test('Encrypt_KnownKey', () => {
	const kdk = new Secret(Buffer.from('master key'));
	const encryptor = new ManagedAuthenticatedEncryptor(
		kdk,
		Aes.create,
		256 / 8,
		() => new HMACSHA256(),
		new SequentialGenRandom(),
	);
	const plaintext = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]).subarray(2, 2 + 3);
	const aad = Buffer.from([7, 6, 5, 4, 3, 2, 1, 0]).subarray(1, 1 + 4);

	const retVal = encryptor.encrypt(plaintext, aad);

	const retValAsString = retVal.toString('base64');
	expect(retValAsString).toBe(
		'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh+36j4yWJOjBgOJxmYDYwhLnYqFxw+9mNh/cudyPrWmJmw4d/dmGaLJLLut2udiAAA=',
	);
});
