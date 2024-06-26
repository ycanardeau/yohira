import { BinaryWriter, Guid, MemoryStream } from '@yohira/base';
import { CryptographicError } from '@yohira/cryptography';
import {
	AuthenticatedEncryptorFactory,
	CacheableKeyRing,
	IAuthenticatedEncryptor,
	IAuthenticatedEncryptorDescriptor,
	IAuthenticatedEncryptorFactory,
	ICacheableKeyRingProvider,
	IKeyRing,
	IKeyRingProvider,
	Key,
	KeyManagementOptions,
	KeyRing,
	KeyRingBasedDataProtector,
	KeyRingProvider,
	writeGuid,
} from '@yohira/data-protection';
import { IDataProtector } from '@yohira/data-protection.abstractions';
import {
	ILogger,
	NullLoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { createOptions } from '@yohira/extensions.options';
import { expect, test } from 'vitest';

class TestKeyRingProvider implements ICacheableKeyRingProvider {
	constructor(private keyRing: CacheableKeyRing) {}

	getCacheableKeyRing(): CacheableKeyRing {
		return this.keyRing;
	}
}

class RefreshTestKeyRingProvider implements ICacheableKeyRingProvider {
	private called = false;

	constructor(
		private keyRing: CacheableKeyRing,
		private refreshKeyRing: CacheableKeyRing,
	) {}

	getCacheableKeyRing(): CacheableKeyRing {
		if (!this.called) {
			this.called = true;
			return this.keyRing;
		}
		return this.refreshKeyRing;
	}
}

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
		writer[Symbol.dispose]();
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
	} as IKeyRing;
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
	} as IKeyRing;
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

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L194
test('Unprotect_KeyNotFound_ThrowsKeyNotFound', () => {
	const notFoundKeyId = Guid.fromString(
		'654057ab-2491-4471-a72a-b3b114afda38',
	);
	const protectedData = buildProtectedDataFromCiphertext(
		notFoundKeyId,
		Buffer.alloc(0),
	);

	const mockDescriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const mockEncryptorFactory: IAuthenticatedEncryptorFactory = {
		createEncryptorInstance: () => ({
			decrypt: () => Buffer.alloc(0),
			encrypt: () => Buffer.alloc(0),
		}),
	};

	// the keyring has only one key
	const key = new Key(
		Guid.empty(),
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	const keyRing = new KeyRing(key, [key]);
	const mockKeyRingProvider: IKeyRingProvider = {
		getCurrentKeyRing(): IKeyRing {
			return keyRing;
		},
	};

	const protector = new KeyRingBasedDataProtector(
		mockKeyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	expect(() => protector.unprotect(protectedData)).toThrowError(
		`The key ${
			notFoundKeyId.toString(/* TODO: 'B' */)
		} was not found in the key ring.`,
	);
});

function createKeyRingProvider(
	cacheableKeyRingProvider: ICacheableKeyRingProvider,
): KeyRingProvider {
	const mockEncryptorFactory: IAuthenticatedEncryptorFactory = {
		createEncryptorInstance: () => ({
			decrypt: () => Buffer.alloc(0),
			encrypt: () => Buffer.alloc(0),
		}),
	};
	const options = new KeyManagementOptions();
	options.authenticatedEncryptorFactories.add(mockEncryptorFactory);

	const keyRingProvider = new KeyRingProvider(
		undefined!,
		createOptions(options),
		undefined!,
		NullLoggerFactory.instance,
	);
	keyRingProvider.cacheableKeyRingProvider = cacheableKeyRingProvider;
	return keyRingProvider;
}

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L247
test('Unprotect_KeyNotFound_RefreshOnce_ThrowsKeyNotFound', () => {
	const notFoundKeyId = Guid.fromString(
		'654057ab-2491-4471-a72a-b3b114afda38',
	);
	const protectedData = buildProtectedDataFromCiphertext(
		notFoundKeyId,
		Buffer.alloc(0),
	);

	const mockDescriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const mockEncryptorFactory: IAuthenticatedEncryptorFactory = {
		createEncryptorInstance: () => ({
			decrypt: () => Buffer.alloc(0),
			encrypt: () => Buffer.alloc(0),
		}),
	};
	const encryptorFactory = new AuthenticatedEncryptorFactory(
		NullLoggerFactory.instance,
	);

	// the keyring has only one key
	const key = new Key(
		Guid.empty(),
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	const keyRing = CacheableKeyRing.create(
		// TODO: expirationToken,
		Number.MAX_VALUE /* TODO */,
		key,
		[key],
	);

	const keyRingProvider = createKeyRingProvider(
		new TestKeyRingProvider(keyRing),
	);

	const protector = new KeyRingBasedDataProtector(
		keyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	expect(() => protector.unprotect(protectedData)).toThrowError(
		`The key ${
			notFoundKeyId.toString(/* TODO: 'B' */)
		} was not found in the key ring.`,
	);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L278
test('Unprotect_KeyNotFound_WontRefreshOnce_AfterTooLong', () => {
	const notFoundKeyId = Guid.fromString(
		'654057ab-2491-4471-a72a-b3b114afda38',
	);
	const protectedData = buildProtectedDataFromCiphertext(
		notFoundKeyId,
		Buffer.alloc(0),
	);

	const mockDescriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const mockEncryptorFactory: IAuthenticatedEncryptorFactory = {
		createEncryptorInstance: () => ({
			decrypt: () => Buffer.alloc(0),
			encrypt: () => Buffer.alloc(0),
		}),
	};
	const encryptorFactory = new AuthenticatedEncryptorFactory(
		NullLoggerFactory.instance,
	);

	// the keyring has only one key
	const key = new Key(
		Guid.empty(),
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	const keyRing = CacheableKeyRing.create(
		// TODO: expirationToken,
		Number.MAX_VALUE /* TODO */,
		key,
		[key],
	);

	// the refresh keyring has the notfound key
	const key2 = new Key(
		notFoundKeyId,
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	const keyRing2 = CacheableKeyRing.create(
		// TODO: expirationToken,
		Number.MAX_VALUE /* TODO */,
		key2,
		[key2],
	);

	const keyRingProvider = createKeyRingProvider(
		new RefreshTestKeyRingProvider(keyRing, keyRing2),
	);
	keyRingProvider.autoRefreshWindowEnd = Date.now();

	const protector = new KeyRingBasedDataProtector(
		keyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	expect(() => protector.unprotect(protectedData)).toThrowError(
		`The key ${
			notFoundKeyId.toString(/* TODO: 'B' */)
		} was not found in the key ring.`,
	);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L314
test('Unprotect_KeyNotFound_RefreshOnce_CanFindKey', () => {
	const notFoundKeyId = Guid.fromString(
		'654057ab-2491-4471-a72a-b3b114afda38',
	);
	const protectedData = buildProtectedDataFromCiphertext(
		notFoundKeyId,
		Buffer.alloc(0),
	);

	const mockDescriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const mockEncryptorFactory: IAuthenticatedEncryptorFactory = {
		createEncryptorInstance: () => ({
			decrypt: () => Buffer.alloc(0),
			encrypt: () => Buffer.alloc(0),
		}),
	};
	const encryptorFactory = new AuthenticatedEncryptorFactory(
		NullLoggerFactory.instance,
	);

	// the keyring has only one key
	const key = new Key(
		Guid.empty(),
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	const keyRing = CacheableKeyRing.create(
		// TODO: expirationToken,
		Number.MAX_VALUE /* TODO */,
		key,
		[key],
	);

	// the refresh keyring has the notfound key
	const key2 = new Key(
		notFoundKeyId,
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	const keyRing2 = CacheableKeyRing.create(
		// TODO: expirationToken,
		Number.MAX_VALUE /* TODO */,
		key2,
		[key2],
	);

	const keyRingProvider = createKeyRingProvider(
		new RefreshTestKeyRingProvider(keyRing, keyRing2),
	);

	const protector = new KeyRingBasedDataProtector(
		keyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	const result = protector.unprotect(protectedData);
	expect(result.equals(Buffer.alloc(0))).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L381
test('Unprotect_KeyRevoked_RevocationDisallowed_ThrowsKeyRevoked', () => {
	const keyId = Guid.fromString('654057ab-2491-4471-a72a-b3b114afda38');
	const protectedData = buildProtectedDataFromCiphertext(
		keyId,
		Buffer.alloc(0),
	);

	const mockDescriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const mockEncryptorFactory: IAuthenticatedEncryptorFactory = {
		createEncryptorInstance: () => ({
			decrypt: () => Buffer.alloc(0),
			encrypt: () => Buffer.alloc(0),
		}),
	};

	// the keyring has only one key
	const key = new Key(
		keyId,
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	key.setRevoked();
	const keyRing = new KeyRing(
		// TODO: expirationToken,
		key,
		[key],
	);
	const mockKeyRingProvider: IKeyRingProvider = {
		getCurrentKeyRing: () => keyRing,
	};

	const protector = new KeyRingBasedDataProtector(
		mockKeyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	expect(() => protector.unprotect(protectedData)).toThrowError(
		`The key ${keyId.toString(/* TODO: 'B' */)} has been revoked.`,
	);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L412
test('Unprotect_KeyRevoked_RevocationAllowed_ReturnsOriginalData_SetsRevokedAndMigrationFlags', () => {
	const defaultKeyId = Guid.fromString(
		'ba73c9ce-d322-4e45-af90-341307e11c38',
	);
	const expectedCiphertext = Buffer.from([
		0x03, 0x05, 0x07, 0x11, 0x13, 0x17, 0x19,
	]);
	const protectedData = buildProtectedDataFromCiphertext(
		defaultKeyId,
		expectedCiphertext,
	);
	const expectedAad = buildAadFromPurposeStrings(defaultKeyId, 'purpose');
	const expectedPlaintext = Buffer.from([0x23, 0x29, 0x31, 0x37]);

	const mockEncryptor: IAuthenticatedEncryptor = {
		decrypt: (actualCiphertext, actualAad) => {
			expect(actualCiphertext.equals(expectedCiphertext)).toBe(true);
			expect(actualAad.equals(expectedAad)).toBe(true);
			return expectedPlaintext;
		},
		encrypt: () => Buffer.alloc(0),
	};
	const mockDescriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const mockEncryptorFactory: IAuthenticatedEncryptorFactory = {
		createEncryptorInstance: () => mockEncryptor,
	};

	const defaultKey = new Key(
		defaultKeyId,
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	defaultKey.setRevoked();
	const keyRing = new KeyRing(defaultKey, [defaultKey]);
	const mockKeyRingProvider: IKeyRingProvider = {
		getCurrentKeyRing: () => keyRing,
	};

	const protector = new KeyRingBasedDataProtector(
		mockKeyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	let requiresMigration = false;
	let wasRevoked = false;
	const retVal = protector.dangerousUnprotect(
		protectedData,
		true,
		{ set: (value) => (requiresMigration = value) },
		{ set: (value) => (wasRevoked = value) },
	);

	expect(retVal.equals(expectedPlaintext)).toBe(true);
	expect(requiresMigration).toBe(true);
	expect(wasRevoked).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L459
test('Unprotect_IsAlsoDefaultKey_Success_NoMigrationRequired', () => {
	const defaultKeyId = Guid.fromString(
		'ba73c9ce-d322-4e45-af90-341307e11c38',
	);
	const expectedCiphertext = Buffer.from([
		0x03, 0x05, 0x07, 0x11, 0x13, 0x17, 0x19,
	]);
	const protectedData = buildProtectedDataFromCiphertext(
		defaultKeyId,
		expectedCiphertext,
	);
	const expectedAad = buildAadFromPurposeStrings(defaultKeyId, 'purpose');
	const expectedPlaintext = Buffer.from([0x23, 0x29, 0x31, 0x37]);

	const mockEncryptor: IAuthenticatedEncryptor = {
		decrypt: (actualCiphertext, actualAad) => {
			expect(actualCiphertext.equals(expectedCiphertext)).toBe(true);
			expect(actualAad.equals(expectedAad)).toBe(true);
			return expectedPlaintext;
		},
		encrypt: () => Buffer.alloc(0),
	};
	const mockDescriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const mockEncryptorFactory: IAuthenticatedEncryptorFactory = {
		createEncryptorInstance: () => mockEncryptor,
	};

	const defaultKey = new Key(
		defaultKeyId,
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	const keyRing = new KeyRing(defaultKey, [defaultKey]);
	const mockKeyRingProvider: IKeyRingProvider = {
		getCurrentKeyRing: () => keyRing,
	};

	const protector = new KeyRingBasedDataProtector(
		mockKeyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	let retVal = protector.unprotect(protectedData);
	expect(retVal.equals(expectedPlaintext)).toBe(true);

	let requiresMigration = false;
	let wasRevoked = false;
	retVal = protector.dangerousUnprotect(
		protectedData,
		false,
		{ set: (value) => (requiresMigration = value) },
		{ set: (value) => (wasRevoked = value) },
	);
	expect(retVal.equals(expectedPlaintext)).toBe(true);
	expect(requiresMigration).toBe(false);
	expect(wasRevoked).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L507
test('Unprotect_IsNotDefaultKey_Success_RequiresMigration', () => {
	const defaultKeyId = Guid.fromString(
		'ba73c9ce-d322-4e45-af90-341307e11c38',
	);
	const embeddedKeyId = Guid.fromString(
		'9b5d2db3-299f-4eac-89e9-e9067a5c1853',
	);
	const expectedCiphertext = Buffer.from([
		0x03, 0x05, 0x07, 0x11, 0x13, 0x17, 0x19,
	]);
	const protectedData = buildProtectedDataFromCiphertext(
		embeddedKeyId,
		expectedCiphertext,
	);
	const expectedAad = buildAadFromPurposeStrings(embeddedKeyId, 'purpose');
	const expectedPlaintext = Buffer.from([0x23, 0x29, 0x31, 0x37]);

	const mockEncryptor: IAuthenticatedEncryptor = {
		decrypt: (actualCiphertext, actualAad) => {
			expect(actualCiphertext.equals(expectedCiphertext)).toBe(true);
			expect(actualAad.equals(expectedAad)).toBe(true);
			return expectedPlaintext;
		},
		encrypt: () => Buffer.alloc(0),
	};
	const mockDescriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const mockEncryptorFactory: IAuthenticatedEncryptorFactory = {
		createEncryptorInstance: () => mockEncryptor,
	};

	const defaultKey = new Key(
		defaultKeyId,
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	const embeddedKey = new Key(
		embeddedKeyId,
		Date.now(),
		Date.now(),
		Date.now(),
		mockDescriptor,
		[mockEncryptorFactory],
	);
	const keyRing = new KeyRing(defaultKey, [defaultKey, embeddedKey]);
	const mockKeyRingProvider: IKeyRingProvider = {
		getCurrentKeyRing: () => keyRing,
	};

	const protector = new KeyRingBasedDataProtector(
		mockKeyRingProvider,
		getLogger(),
		undefined,
		'purpose',
	);

	let retVal = protector.unprotect(protectedData);
	expect(retVal.equals(expectedPlaintext)).toBe(true);

	let requiresMigration = false;
	let wasRevoked = false;
	retVal = protector.dangerousUnprotect(
		protectedData,
		false,
		{ set: (value) => (requiresMigration = value) },
		{ set: (value) => (wasRevoked = value) },
	);
	expect(retVal.equals(expectedPlaintext)).toBe(true);
	expect(requiresMigration).toBe(true);
	expect(wasRevoked).toBe(false);
});

// TODO

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingBasedDataProtectorTests.cs#L584
test('CreateProtector_ChainsPurposes', () => {
	const defaultKey = Guid.fromString('ba73c9ce-d322-4e45-af90-341307e11c38');
	const expectedPlaintext = Buffer.from([
		0x03, 0x05, 0x07, 0x11, 0x13, 0x17, 0x19,
	]);
	const expectedAad = buildAadFromPurposeStrings(
		defaultKey,
		'purpose1',
		'purpose2',
	);
	const expectedProtectedData = buildProtectedDataFromCiphertext(
		defaultKey,
		Buffer.from([0x23, 0x29, 0x31, 0x37]),
	);

	const mockEncryptor: IAuthenticatedEncryptor = {
		encrypt: (actualPlaintext, actualAad) => {
			expect(actualPlaintext.equals(expectedPlaintext)).toBe(true);
			expect(actualAad.equals(expectedAad)).toBe(true);
			return Buffer.from([0x23, 0x29, 0x31, 0x37]); // ciphertext + tag
		},
		decrypt: () => Buffer.alloc(0),
	};

	const mockKeyRing: IKeyRing = {
		defaultKeyId: defaultKey,
		defaultAuthenticatedEncryptor: mockEncryptor,
	} as IKeyRing;
	const mockKeyRingProvider: IKeyRingProvider = {
		getCurrentKeyRing: () => mockKeyRing,
	};

	const protector = new KeyRingBasedDataProtector(
		mockKeyRingProvider,
		getLogger(),
		undefined,
		'purpose1',
	).createProtector('purpose2');

	const retVal = protector.protect(expectedPlaintext);

	expect(retVal.equals(expectedProtectedData)).toBe(true);
});
