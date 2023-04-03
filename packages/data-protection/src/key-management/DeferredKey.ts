import { Guid, Lazy, XElement } from '@yohira/base';

import { IAuthenticatedEncryptorDescriptor } from '../authenticated-encryption/IAuthenticatedEncryptorDescriptor';
import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import { KeyBase } from './KeyBase';
import { IInternalXmlKeyManager } from './internal/IInternalXmlKeyManager';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/DeferredKey.cs,a054a592e9e2056b,references
export class DeferredKey extends KeyBase {
	private static getLazyDescriptorDelegate(
		keyManager: IInternalXmlKeyManager,
		keyElement: XElement,
	): () => IAuthenticatedEncryptorDescriptor {
		// TODO
		throw new Error('Method not implemented.');
	}

	constructor(
		keyId: Guid,
		creationDate: number,
		activationDate: number,
		expirationDate: number,
		keyManager: IInternalXmlKeyManager,
		keyElement: XElement,
		encryptorFactories: Iterable<IAuthenticatedEncryptorFactory>,
	) {
		super(
			keyId,
			creationDate,
			activationDate,
			expirationDate,
			new Lazy<IAuthenticatedEncryptorDescriptor>(
				DeferredKey.getLazyDescriptorDelegate(keyManager, keyElement),
			),
			encryptorFactories,
		);
	}
}
