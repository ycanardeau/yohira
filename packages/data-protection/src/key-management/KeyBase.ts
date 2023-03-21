import { Guid, Lazy } from '@yohira/base';

import { IAuthenticatedEncryptorDescriptor } from '../authenticated-encryption/IAuthenticatedEncryptorDescriptor';
import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import { IKey } from './IKey';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyBase.cs,5ec1c24aae0ef7c2,references
export abstract class KeyBase implements IKey {
	constructor(
		readonly keyId: Guid,
		readonly creationDate: Date,
		readonly activationDate: Date,
		readonly expirationDate: Date,
		private readonly lazyDescriptor: Lazy<IAuthenticatedEncryptorDescriptor>,
		private readonly encryptorFactories: Iterable<IAuthenticatedEncryptorFactory>,
	) {}
}
