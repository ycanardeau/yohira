import { Guid } from '@yohira/base';
import {
	DeferredKey,
	IAuthenticatedEncryptorDescriptor,
	IAuthenticatedEncryptorFactory,
	IInternalXmlKeyManager,
} from '@yohira/data-protection';
import { XElement } from '@yohira/xml';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DeferredKeyTests.cs#L16
/* TODO: test('Ctor_Properties', () => {
	const keyId = Guid.newGuid();
	const creationDate = Date.now();
	const activationDate = Date.now() + 2 * 24 * 60 * 60 * 1000;
	const expirationDate = Date.now() + 90 * 24 * 60 * 60 * 1000;
	const mockDescriptor: IAuthenticatedEncryptorDescriptor =
		{} as IAuthenticatedEncryptorDescriptor;
	const mockInternalKeyManager: IInternalXmlKeyManager =
		{} as IInternalXmlKeyManager;
	const encryptorFactory: IAuthenticatedEncryptorFactory =
		{} as IAuthenticatedEncryptorFactory;

	const key = new DeferredKey(
		keyId,
		creationDate,
		activationDate,
		expirationDate,
		mockInternalKeyManager,
		XElement.parse('<node />'),
		[encryptorFactory],
	);

	expect(key.keyId).toBe(keyId);
	expect(key.creationDate).toBe(creationDate);
	expect(key.activationDate).toBe(activationDate);
	expect(key.expirationDate).toBe(expirationDate);
	expect(key.descriptor === mockDescriptor).toBe(true);
}); */

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DeferredKeyTests.cs#L45
test('SetRevoked_Respected', () => {
	const now = Date.now();
	const encryptorFactory: IAuthenticatedEncryptorFactory =
		{} as IAuthenticatedEncryptorFactory;
	const key = new DeferredKey(
		Guid.empty,
		now,
		now,
		now,
		{} as IInternalXmlKeyManager,
		XElement.parse('<node />'),
		[encryptorFactory],
	);

	expect(key.isRevoked).toBe(false);
	key.setRevoked();
	expect(key.isRevoked).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/DeferredKeyTests.cs#L59
/* TODO: test('Get_Descriptor_CachesFailures', () => {
	let numTimesCalled = 0;
	const mockKeyManager: IInternalXmlKeyManager = {
		deserializeDescriptorFromKeyElement: (
			element,
		): IAuthenticatedEncryptorDescriptor => {
			numTimesCalled++;
			throw new Error('How exceptional.');
		},
	} as IInternalXmlKeyManager;

	const now = Date.now();
	const encryptorFactory: IAuthenticatedEncryptorFactory =
		{} as IAuthenticatedEncryptorFactory;
	const key = new DeferredKey(
		Guid.empty,
		now,
		now,
		now,
		mockKeyManager,
		XElement.parse('<node />'),
		[encryptorFactory],
	);

	expect(() => key.descriptor).toThrowError('How exceptional.');
	expect(() => key.descriptor).toThrowError('How exceptional.');
	expect(numTimesCalled).toBe(1);
}); */
