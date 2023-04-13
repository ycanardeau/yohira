import { Guid } from '@yohira/base';
import {
	DefaultKeyResolver,
	IAuthenticatedEncryptor,
	IDefaultKeyResolver,
	IKey,
} from '@yohira/data-protection';
import { NullLoggerFactory } from '@yohira/extensions.logging.abstractions';
import { expect, test } from 'vitest';

function createDefaultKeyResolver(): IDefaultKeyResolver {
	return new DefaultKeyResolver(NullLoggerFactory.instance);
}

function createKey(
	activationDate: string,
	expirationDate: string,
	creationDate?: string,
	isRevoked = false,
	createEncryptorThrows = false,
): IKey {
	const mockKey: IKey = {
		get keyId() {
			return Guid.newGuid();
		},
		get creationDate() {
			return creationDate !== undefined
				? new Date(creationDate).getTime()
				: 0; /* TODO */
		},
		get activationDate() {
			return new Date(activationDate).getTime();
		},
		get expirationDate() {
			return new Date(expirationDate).getTime();
		},
		get isRevoked() {
			return isRevoked;
		},
		createEncryptor: createEncryptorThrows
			? (): IAuthenticatedEncryptor => {
					throw new Error('This method fails.');
			  }
			: (): IAuthenticatedEncryptor => ({} as IAuthenticatedEncryptor),
	} as IKey;

	return mockKey;
}

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L16
test('ResolveDefaultKeyPolicy_EmptyKeyRing_ReturnsNullDefaultKey', () => {
	const resolver = createDefaultKeyResolver();

	const resolution = resolver.resolveDefaultKeyPolicy(Date.now(), []);

	expect(resolution.defaultKey).toBeUndefined();
	expect(resolution.shouldGenerateNewKey).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L30
test('ResolveDefaultKeyPolicy_ValidExistingKey_ReturnsExistingKey', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey('2015-03-01 00:00:00Z', '2016-03-01 00:00:00Z');
	const key2 = createKey('2016-03-01 00:00:00Z', '2017-03-01 00:00:00Z');

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2016-02-20 23:59:00Z').getTime(),
		[key1, key2],
	);

	expect(resolution.defaultKey === key1).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L46
test('ResolveDefaultKeyPolicy_ValidExistingKey_AllowsForClockSkew_KeysStraddleSkewLine_ReturnsExistingKey', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey('2015-03-01 00:00:00Z', '2016-03-01 00:00:00Z');
	const key2 = createKey('2016-03-01 00:00:00Z', '2017-03-01 00:00:00Z');

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2016-02-29 23:59:00Z').getTime(),
		[key1, key2],
	);

	expect(resolution.defaultKey === key2).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L62
test('ResolveDefaultKeyPolicy_ValidExistingKey_AllowsForClockSkew_AllKeysInFuture_ReturnsExistingKey', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey('2016-03-01 00:00:00Z', '2017-03-01 00:00:00Z');

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2016-02-29 23:59:00Z').getTime(),
		[key1],
	);

	expect(resolution.defaultKey === key1).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L77
test('ResolveDefaultKeyPolicy_ValidExistingKey_NoSuccessor_ReturnsExistingKey_SignalsGenerateNewKey', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey('2015-03-01 00:00:00Z', '2016-03-01 00:00:00Z');

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2016-02-29 23:59:00Z').getTime(),
		[key1],
	);

	expect(resolution.defaultKey === key1).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L92
test('ResolveDefaultKeyPolicy_ValidExistingKey_NoLegitimateSuccessor_ReturnsExistingKey_SignalsGenerateNewKey', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey('2015-03-01 00:00:00Z', '2016-03-01 00:00:00Z');
	const key2 = createKey(
		'2016-03-01 00:00:00Z',
		'2017-03-01 00:00:00Z',
		undefined,
		true,
	);
	const key3 = createKey('2016-03-01 00:00:00Z', '2016-03-02 00:00:00Z'); // key expires too soon

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2016-02-29 23:50:00Z').getTime(),
		[key1, key2, key3],
	);

	expect(resolution.defaultKey === key1).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L109
test('ResolveDefaultKeyPolicy_MostRecentKeyIsInvalid_BecauseOfRevocation_ReturnsNull', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey('2015-03-01 00:00:00Z', '2016-03-01 00:00:00Z');
	const key2 = createKey(
		'2015-03-02 00:00:00Z',
		'2016-03-01 00:00:00Z',
		undefined,
		true,
	);

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2015-04-01 00:00:00Z').getTime(),
		[key1, key2],
	);

	expect(resolution.defaultKey).toBeUndefined();
	expect(resolution.shouldGenerateNewKey).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L125
test('ResolveDefaultKeyPolicy_MostRecentKeyIsInvalid_BecauseOfFailureToDecipher_ReturnsNull', () => {
	const key1 = createKey('2015-03-01 00:00:00Z', '2016-03-01 00:00:00Z');
	const key2 = createKey(
		'2015-03-02 00:00:00Z',
		'2016-03-01 00:00:00Z',
		undefined,
		false,
		true,
	);
	const resolver = createDefaultKeyResolver();

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2015-04-01 00:00:00Z').getTime(),
		[key1, key2],
	);

	expect(resolution.defaultKey).toBeUndefined();
	expect(resolution.shouldGenerateNewKey).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L141
test('ResolveDefaultKeyPolicy_FutureKeyIsValidAndWithinClockSkew_ReturnsFutureKey', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey('2015-03-01 00:00:00Z', '2016-03-01 00:00:00Z');

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2015-02-28 23:55:00Z').getTime(),
		[key1],
	);

	expect(resolution.defaultKey === key1).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L156
test('ResolveDefaultKeyPolicy_FutureKeyIsValidButNotWithinClockSkew_ReturnsNull', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey('2015-03-01 00:00:00Z', '2016-03-01 00:00:00Z');

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2015-02-28 23:00:00Z').getTime(),
		[key1],
	);

	expect(resolution.defaultKey).toBeUndefined();
	expect(resolution.shouldGenerateNewKey).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L171
test('ResolveDefaultKeyPolicy_IgnoresExpiredOrRevokedFutureKeys', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey('2015-03-01 00:00:00Z', '2014-03-01 00:00:00Z'); // expiration before activation should never occur
	const key2 = createKey(
		'2015-03-01 00:01:00Z',
		'2015-04-01 00:00:00Z',
		undefined,
		true,
	);
	const key3 = createKey('2015-03-01 00:02:00Z', '2015-04-01 00:00:00Z');

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2015-02-28 23:59:00Z').getTime(),
		[key1, key2, key3],
	);

	expect(resolution.defaultKey === key3).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L188
test('ResolveDefaultKeyPolicy_FallbackKey_SelectsLatestBeforePriorPropagationWindow_IgnoresRevokedKeys', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-01 00:00:00Z',
	);
	const key2 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-02 00:00:00Z',
	);
	const key3 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-03 00:00:00Z',
		true,
	);
	const key4 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-04 00:00:00Z',
	);

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2000-01-05 00:00:00Z').getTime(),
		[key1, key2, key3, key4],
	);

	expect(resolution.fallbackKey === key2).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L206
test('ResolveDefaultKeyPolicy_FallbackKey_SelectsLatestBeforePriorPropagationWindow_IgnoresFailures', () => {
	const key1 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-01 00:00:00Z',
	);
	const key2 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-02 00:00:00Z',
	);
	const key3 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-03 00:00:00Z',
		true,
	);
	const key4 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-04 00:00:00Z',
	);
	const resolver = createDefaultKeyResolver();

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2000-01-05 00:00:00Z').getTime(),
		[key1, key2, key3, key4],
	);

	expect(resolution.fallbackKey === key2).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DefaultKeyResolverTests.cs#L224
test('ResolveDefaultKeyPolicy_FallbackKey_NoNonRevokedKeysBeforePriorPropagationWindow_SelectsEarliestNonRevokedKey', () => {
	const resolver = createDefaultKeyResolver();
	const key1 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-03 00:00:00Z',
		true,
	);
	const key2 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-04 00:00:00Z',
	);
	const key3 = createKey(
		'2010-01-01 00:00:00Z',
		'2010-01-01 00:00:00Z',
		'2000-01-05 00:00:00Z',
	);

	const resolution = resolver.resolveDefaultKeyPolicy(
		new Date('2000-01-05 00:00:00Z').getTime(),
		[key1, key2, key3],
	);

	expect(resolution.fallbackKey === key2).toBe(true);
	expect(resolution.shouldGenerateNewKey).toBe(true);
});
