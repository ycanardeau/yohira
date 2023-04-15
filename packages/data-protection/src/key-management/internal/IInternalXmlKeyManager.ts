import { Guid } from '@yohira/base';
import { XElement } from '@yohira/xml';

import { IAuthenticatedEncryptorDescriptor } from '../../authenticated-encryption/conifg-model/IAuthenticatedEncryptorDescriptor';
import { IKey } from '../IKey';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/Internal/IInternalXmlKeyManager.cs,319d176791687e24,references
export interface IInternalXmlKeyManager {
	createNewKeyCore(
		keyId: Guid,
		creationDate: number,
		activationDate: number,
		expirationDate: number,
	): IKey;
	deserializeDescriptorFromKeyElement(
		keyElement: XElement,
	): IAuthenticatedEncryptorDescriptor;
}
