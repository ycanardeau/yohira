import { XElement } from '@yohira/base';

import { IAuthenticatedEncryptorDescriptor } from '../../authenticated-encryption/IAuthenticatedEncryptorDescriptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/Internal/IInternalXmlKeyManager.cs,319d176791687e24,references
export interface IInternalXmlKeyManager {
	deserializeDescriptorFromKeyElement(
		keyElement: XElement,
	): IAuthenticatedEncryptorDescriptor;
}
