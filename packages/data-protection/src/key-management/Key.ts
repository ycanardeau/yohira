import { Guid, Lazy } from '@yohira/base';

import { IAuthenticatedEncryptorDescriptor } from '../authenticated-encryption/IAuthenticatedEncryptorDescriptor';
import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import { KeyBase } from './KeyBase';

export class Key extends KeyBase {
	constructor(
		keyId: Guid,
		creationDate: Date,
		activationDate: Date,
		expirationDate: Date,
		descriptor: IAuthenticatedEncryptorDescriptor,
		encryptorFactories: Iterable<IAuthenticatedEncryptorFactory>,
	) {
		super(
			keyId,
			creationDate,
			activationDate,
			expirationDate,
			new Lazy(() => descriptor),
			encryptorFactories,
		);
	}
}
