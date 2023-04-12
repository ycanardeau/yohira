import { Guid, Lazy } from '@yohira/base';

import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import { IAuthenticatedEncryptorDescriptor } from '../authenticated-encryption/conifg-model/IAuthenticatedEncryptorDescriptor';
import { KeyBase } from './KeyBase';

export class Key extends KeyBase {
	constructor(
		keyId: Guid,
		creationDate: number,
		activationDate: number,
		expirationDate: number,
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
