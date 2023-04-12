import { Guid } from '@yohira/base';
import {
	IAuthenticatedEncryptorDescriptor,
	IAuthenticatedEncryptorFactory,
	Key,
} from '@yohira/data-protection';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyTests.cs#L13
test('Ctor_Properties', () => {
	const keyId = Guid.newGuid();
	const creationDate = Date.now();
	const activationDate = Date.now() + 2 * 24 * 60 * 60 * 1000;
	const expirationDate = Date.now() + 90 * 24 * 60 * 60 * 1000;
	const descriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const encryptorFactory: IAuthenticatedEncryptorFactory =
		{} as IAuthenticatedEncryptorFactory;

	const key = new Key(
		keyId,
		creationDate,
		activationDate,
		expirationDate,
		descriptor,
		[encryptorFactory],
	);

	expect(key.keyId.toString()).toBe(keyId.toString());
	expect(key.creationDate).toBe(creationDate);
	expect(key.activationDate).toBe(activationDate);
	expect(key.expirationDate).toBe(expirationDate);
	expect(key.descriptor === descriptor).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyTests.cs#L35
test('SetRevoked_Respected', () => {
	const now = Date.now();
	const encryptorFactory: IAuthenticatedEncryptorFactory =
		{} as IAuthenticatedEncryptorFactory;
	const key = new Key(
		Guid.empty,
		now,
		now,
		now,
		{} as IAuthenticatedEncryptorDescriptor,
		[encryptorFactory],
	);

	expect(key.isRevoked).toBe(false);
	key.setRevoked();
	expect(key.isRevoked).toBe(true);
});
