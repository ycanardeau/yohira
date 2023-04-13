import { Guid } from '@yohira/base';
import {
	IAuthenticatedEncryptor,
	IAuthenticatedEncryptorDescriptor,
	IKey,
	KeyRing,
} from '@yohira/data-protection';
import { expect, test } from 'vitest';

class MyKey implements IKey {
	numTimesCreateEncryptorInstanceCalled = 0;
	private readonly encryptorFactory: () => IAuthenticatedEncryptor;

	readonly activationDate: number;
	readonly creationDate: number;
	readonly expirationDate: number;
	readonly isRevoked: boolean;
	readonly keyId: Guid;

	constructor(
		isRevoked = false,
		expectedEncryptorInstance?: IAuthenticatedEncryptor,
	) {
		this.creationDate = Date.now();
		this.activationDate = Date.now() + 1 * 60 * 60 * 1000;
		this.expirationDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
		this.isRevoked = isRevoked;
		this.keyId = Guid.newGuid();
		this.encryptorFactory = (): IAuthenticatedEncryptor =>
			expectedEncryptorInstance ?? ({} as IAuthenticatedEncryptor);
	}

	get descriptor(): IAuthenticatedEncryptorDescriptor {
		throw new Error('Method not implemented.');
	}

	createEncryptor(): IAuthenticatedEncryptor {
		this.numTimesCreateEncryptorInstanceCalled++;
		return this.encryptorFactory();
	}
}

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingTests.cs#L13
test('DefaultAuthenticatedEncryptor_Prop_InstantiationIsDeferred', () => {
	const expectedEncryptorInstance: IAuthenticatedEncryptor =
		{} as IAuthenticatedEncryptor;

	const key1 = new MyKey(false, expectedEncryptorInstance);
	const key2 = new MyKey();

	const keyRing = new KeyRing(key1, [key1, key2]);

	expect(key1.numTimesCreateEncryptorInstanceCalled).toBe(0);
	expect(
		keyRing.defaultAuthenticatedEncryptor === expectedEncryptorInstance,
	).toBe(true);
	expect(key1.numTimesCreateEncryptorInstanceCalled).toBe(1);
	expect(
		keyRing.defaultAuthenticatedEncryptor === expectedEncryptorInstance,
	).toBe(true);
	expect(key1.numTimesCreateEncryptorInstanceCalled).toBe(1);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingTests.cs#L33
test('DefaultKeyId_Prop', () => {
	const key1 = new MyKey();
	const key2 = new MyKey();

	const keyRing = new KeyRing(key2, [key1, key2]);

	expect(keyRing.defaultKeyId.equals(key2.keyId)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingTests.cs#L47
test('DefaultKeyIdAndEncryptor_IfDefaultKeyNotPresentInAllKeys', () => {
	const key1 = new MyKey();
	const key2 = new MyKey();
	const key3 = new MyKey(false, {} as IAuthenticatedEncryptor);

	const keyRing = new KeyRing(key3, [key1, key2]);

	expect(keyRing.defaultKeyId.equals(key3.keyId)).toBe(true);
	expect(
		keyRing.getAuthenticatedEncryptorByKeyId(key3.keyId, {
			set: () => {},
		}) === key3.createEncryptor(),
	).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/KeyRingTests.cs#L63
test('GetAuthenticatedEncryptorByKeyId_DefersInstantiation_AndReturnsRevocationInfo', () => {
	const expectedEncryptorInstance1 = {} as IAuthenticatedEncryptor;
	const expectedEncryptorInstance2 = {} as IAuthenticatedEncryptor;

	const key1 = new MyKey(true, expectedEncryptorInstance1);
	const key2 = new MyKey(false, expectedEncryptorInstance2);

	const keyRing = new KeyRing(key2, [key1, key2]);

	expect(key1.numTimesCreateEncryptorInstanceCalled).toBe(0);
	let isRevoked = false;
	expect(
		keyRing.getAuthenticatedEncryptorByKeyId(key1.keyId, {
			set: (value) => (isRevoked = value),
		}) === expectedEncryptorInstance1,
	).toBe(true);
	expect(isRevoked).toBe(true);
	expect(key1.numTimesCreateEncryptorInstanceCalled).toBe(1);
	expect(
		keyRing.getAuthenticatedEncryptorByKeyId(key1.keyId, {
			set: (value) => (isRevoked = value),
		}) === expectedEncryptorInstance1,
	).toBe(true);
	expect(isRevoked).toBe(true);
	expect(key1.numTimesCreateEncryptorInstanceCalled).toBe(1);
	expect(key2.numTimesCreateEncryptorInstanceCalled).toBe(0);
	expect(
		keyRing.getAuthenticatedEncryptorByKeyId(key2.keyId, {
			set: (value) => (isRevoked = value),
		}) === expectedEncryptorInstance2,
	).toBe(true);
	expect(isRevoked).toBe(false);
	expect(key2.numTimesCreateEncryptorInstanceCalled).toBe(1);
	expect(
		keyRing.getAuthenticatedEncryptorByKeyId(key2.keyId, {
			set: (value) => (isRevoked = value),
		}) === expectedEncryptorInstance2,
	).toBe(true);
	expect(isRevoked).toBe(false);
	expect(key2.numTimesCreateEncryptorInstanceCalled).toBe(1);
	expect(keyRing.defaultAuthenticatedEncryptor).toBe(
		expectedEncryptorInstance2,
	);
	expect(key2.numTimesCreateEncryptorInstanceCalled).toBe(1);
});
