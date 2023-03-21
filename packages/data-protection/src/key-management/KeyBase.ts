import { Guid, Lazy } from '@yohira/base';

import { IAuthenticatedEncryptor } from '../authenticated-encryption/IAuthenticatedEncryptor';
import { IAuthenticatedEncryptorDescriptor } from '../authenticated-encryption/IAuthenticatedEncryptorDescriptor';
import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import { IKey } from './IKey';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyBase.cs,5ec1c24aae0ef7c2,references
export abstract class KeyBase implements IKey {
	private encryptor?: IAuthenticatedEncryptor;

	constructor(
		readonly keyId: Guid,
		readonly creationDate: number,
		readonly activationDate: number,
		readonly expirationDate: number,
		private readonly lazyDescriptor: Lazy<IAuthenticatedEncryptorDescriptor>,
		private readonly encryptorFactories: Iterable<IAuthenticatedEncryptorFactory>,
	) {}

	private _isRevoked = false;
	get isRevoked(): boolean {
		return this._isRevoked;
	}
	set isRevoked(value: boolean) {
		this._isRevoked = value;
	}

	createEncryptor(): IAuthenticatedEncryptor | undefined {
		if (this.encryptor === undefined) {
			for (const factory of this.encryptorFactories) {
				const encryptor = factory.createEncryptorInstance(this);
				if (encryptor !== undefined) {
					this.encryptor = encryptor;
					break;
				}
			}
		}

		return this.encryptor;
	}
}
