import { IList, List } from '@yohira/base';

import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import { IXmlRepository } from '../repositories/IXmlRepository';
import { IXmlEncryptor } from '../xml-encryption/IXmlEncryptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyManagementOptions.cs,06667162718921af,references
export class KeyManagementOptions {
	xmlRepository?: IXmlRepository;
	xmlEncryptor?: IXmlEncryptor;

	readonly authenticatedEncryptorFactories: IList<IAuthenticatedEncryptorFactory> =
		new List();

	constructor(other?: KeyManagementOptions) {
		if (other !== undefined) {
			// TODO

			for (const encryptorFactory of other.authenticatedEncryptorFactories) {
				this.authenticatedEncryptorFactories.add(encryptorFactory);
			}
		}
	}
}
