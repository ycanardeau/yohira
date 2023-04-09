import { Guid, Lazy, XElement } from '@yohira/base';

import { IAuthenticatedEncryptorDescriptor } from '../authenticated-encryption/IAuthenticatedEncryptorDescriptor';
import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import {
	toSecret,
	toXElement,
} from '../xml-encryption/XmlEncryptionExtensions';
import { KeyBase } from './KeyBase';
import { IInternalXmlKeyManager } from './internal/IInternalXmlKeyManager';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/DeferredKey.cs,a054a592e9e2056b,references
export class DeferredKey extends KeyBase {
	// REVIEW
	private static getLazyDescriptorDelegate(
		keyManager: IInternalXmlKeyManager,
		keyElement: XElement,
	): () => IAuthenticatedEncryptorDescriptor {
		// The <key> element will be held around in memory for a potentially lengthy period
		// of time. Since it might contain sensitive information, we should protect it.
		const encryptedKeyElement = toSecret(keyElement);

		const getLazyDescriptorDelegate =
			(): IAuthenticatedEncryptorDescriptor => {
				return keyManager.deserializeDescriptorFromKeyElement(
					toXElement(encryptedKeyElement),
				);
			};

		try {
			return getLazyDescriptorDelegate;
		} finally {
			// It's important that the lambda above doesn't capture 'descriptorElement'. Clearing the reference here
			// helps us detect if we've done this by causing a null ref at runtime.
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			keyElement = undefined!;
		}
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
