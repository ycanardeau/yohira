import { BinaryWriter, Guid, MemoryStream } from '@yohira/base';
import {
	CryptographicError,
	IAuthenticatedEncryptor,
	IKeyRing,
	IKeyRingProvider,
	KeyRingBasedDataProtector,
	writeGuid,
} from '@yohira/data-protection';
import { IDataProtector } from '@yohira/data-protection.abstractions';
import {
	ILogger,
	NullLoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { expect, test } from 'vitest';

function buildAadFromPurposeStrings(
	keyId: Guid,
	...purposes: string[]
): Buffer {
	let expectedAad = Buffer.concat([
		Buffer.from([0x09, 0xf0, 0xc9, 0xf0]), // magic header
		((): Buffer => {
			const buffer = Buffer.alloc(16);
			writeGuid(buffer, keyId);
			return buffer;
		})(),
		((): Buffer => {
			const buffer = Buffer.alloc(4);
			buffer.writeInt32BE(purposes.length);
			return buffer;
		})(),
	]);

	for (const purpose of purposes) {
		const memStream = MemoryStream.alloc();
		const writer = new BinaryWriter(memStream);
		writer.writeString(purpose); // also writes 7-bit encoded int length
		writer.dispose();
		expectedAad = Buffer.concat([expectedAad, memStream.toBuffer()]);
	}

	return expectedAad;
}

function buildProtectedDataFromCiphertext(
	keyId: Guid,
	ciphertext: Buffer,
): Buffer {
	return Buffer.concat([
		Buffer.from([0x09, 0xf0, 0xc9, 0xf0]), // magic header
		((): Buffer => {
			const buffer = Buffer.alloc(16);
			writeGuid(buffer, keyId);
			return buffer;
		})(), // key id
		Buffer.from(ciphertext),
	]);
}

function getLogger(): ILogger {
	const loggerFactory = NullLoggerFactory.instance;
	return loggerFactory.createLogger(/* TODO: KeyRingBasedDataProtector.name */);
}

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L21
test('Protect_NullPlaintext_Throws', () => {
	const protector: IDataProtector = new KeyRingBasedDataProtector(
		{
			getCurrentKeyRing(): IKeyRing {
				throw new Error();
			},
		},
		getLogger(),
		undefined,
		'purpose',
	);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	expect(() => protector.protect(undefined!)).toThrowError(
		'Value cannot be null.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L35
test('Protect_EncryptsToDefaultProtector_MultiplePurposes', () => {
	const defaultKey = Guid.fromString('ba73c9ce-d322-4e45-af90-341307e11c38');
	const expectedPlaintext = Buffer.from([
		0x03, 0x05, 0x07, 0x11, 0x13, 0x17, 0x19,
	]);
	const expectedAad = buildAadFromPurposeStrings(
		defaultKey,
		'purpose1',
		'purpose2',
		'yet another purpose',
	);
	const expectedProtectedData = buildProtectedDataFromCiphertext(
		defaultKey,
		Buffer.from([0x23, 0x29, 0x31, 0x37]),
	);

	const mockEncryptor: IAuthenticatedEncryptor = {
		encrypt(actualPlaintext: Buffer, actualAad: Buffer): Buffer {
			expect(actualPlaintext.equals(expectedPlaintext)).toBe(true);
			expect(actualAad.equals(expectedAad)).toBe(true);
			return Buffer.from([0x23, 0x29, 0x31, 0x37]); // ciphertext + tag
		},
	} as IAuthenticatedEncryptor;

	const mockKeyRing: IKeyRing = {
		defaultKeyId: defaultKey,
		defaultAuthenticatedEncryptor: mockEncryptor,
	};
	const mockKeyRingProvider: IKeyRingProvider = {
		getCurrentKeyRing(): IKeyRing {
			return mockKeyRing;
		},
	};

	const protector = new KeyRingBasedDataProtector(
		mockKeyRingProvider,
		getLogger(),
		['purpose1', 'purpose2'],
		'yet another purpose',
	);

	const retVal = protector.protect(expectedPlaintext);

	expect(retVal.equals(expectedProtectedData)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L73
test('Protect_EncryptsToDefaultProtector_SinglePurpose', () => {
	const defaultKey = Guid.fromString('ba73c9ce-d322-4e45-af90-341307e11c38');
	const expectedPlaintext = Buffer.from([
		0x03, 0x05, 0x07, 0x11, 0x13, 0x17, 0x19,
	]);
	const expectedAad = buildAadFromPurposeStrings(
		defaultKey,
		'single purpose',
	);
	const expectedProtectedData = buildProtectedDataFromCiphertext(
		defaultKey,
		Buffer.from([0x23, 0x29, 0x31, 0x37]),
	);

	const mockEncryptor: IAuthenticatedEncryptor = {
		encrypt(actualPlaintext: Buffer, actualAad: Buffer): Buffer {
			expect(actualPlaintext.equals(expectedPlaintext)).toBe(true);
			expect(actualAad.equals(expectedAad)).toBe(true);
			return Buffer.from([0x23, 0x29, 0x31, 0x37]); // ciphertext + tag
		},
	} as IAuthenticatedEncryptor;

	const mockKeyRing: IKeyRing = {
		defaultKeyId: defaultKey,
		defaultAuthenticatedEncryptor: mockEncryptor,
	};
	const mockKeyRingProvider: IKeyRingProvider = {
		getCurrentKeyRing(): IKeyRing {
			return mockKeyRing;
		},
	};

	const protector = new KeyRingBasedDataProtector(
		mockKeyRingProvider,
		getLogger(),
		[],
		'single purpose',
	);

	const retVal = protector.protect(expectedPlaintext);

	expect(retVal.equals(expectedProtectedData)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L111
test('Protect_HomogenizesExceptionsToCryptographicException', () => {
	const protector = new KeyRingBasedDataProtector(
		{
			getCurrentKeyRing(): IKeyRing {
				throw new Error(
					'Invocation needs to return a value and therefore must have a corresponding setup that provides it.' /* LOC */,
				);
			},
		},
		getLogger(),
		undefined,
		'purpose',
	);

	try {
		protector.protect(Buffer.alloc(0));
		throw new Error();
	} catch (error) {
		expect(error).toBeInstanceOf(CryptographicError);
		if (error instanceof CryptographicError) {
			expect(error.inner?.message).toBe(
				'Invocation needs to return a value and therefore must have a corresponding setup that provides it.',
			);
		}
	}
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L126
test('Unprotect_NullProtectedData_Throws', () => {
	const protector = new KeyRingBasedDataProtector(
		{} as IKeyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	expect(() => protector.unprotect(undefined!), 'protectedData').toThrowError(
		'Value cannot be null.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L140
test('Unprotect_PayloadTooShort_ThrowsBadMagicHeader', () => {
	const protector = new KeyRingBasedDataProtector(
		{} as IKeyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	let badProtectedPayload = buildProtectedDataFromCiphertext(
		Guid.newGuid(),
		Buffer.alloc(0),
	);
	badProtectedPayload = badProtectedPayload.subarray(
		1,
		badProtectedPayload.length,
	); // chop off the last byte

	expect(() => protector.unprotect(badProtectedPayload)).toThrowError(
		'The provided payload cannot be decrypted because it was not protected with this protection provider.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L158
test('Unprotect_PayloadHasBadMagicHeader_ThrowsBadMagicHeader', () => {
	const protector = new KeyRingBasedDataProtector(
		{} as IKeyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	const badProtectedPayload = buildProtectedDataFromCiphertext(
		Guid.newGuid(),
		Buffer.alloc(0),
	);
	badProtectedPayload[0]++; // corrupt the magic header

	expect(() => protector.unprotect(badProtectedPayload)).toThrowError(
		'The provided payload cannot be decrypted because it was not protected with this protection provider.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L176
test('Unprotect_PayloadHasIncorrectVersionMarker_ThrowsNewerVersion', () => {
	const protector = new KeyRingBasedDataProtector(
		{} as IKeyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	const badProtectedPayload = buildProtectedDataFromCiphertext(
		Guid.newGuid(),
		Buffer.alloc(0),
	);
	badProtectedPayload[3]++; // bump the version payload

	expect(() => protector.unprotect(badProtectedPayload)).toThrowError(
		'The provided payload cannot be decrypted because it was protected with a newer version of the protection provider.',
	);
});

// TODO
