import { ISecret } from '../../ISecret';
import { IAuthenticatedEncryptorDescriptor } from './IAuthenticatedEncryptorDescriptor';
import { ManagedAuthenticatedEncryptorConfig } from './ManagedAuthenticatedEncryptorConfig';
import { XmlSerializedDescriptorInfo } from './XmlSerializedDescriptorInfo';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ConfigurationModel/ManagedAuthenticatedEncryptorDescriptor.cs,ef53bc01bf16d8ca,references
export class ManagedAuthenticatedEncryptorDescriptor
	implements IAuthenticatedEncryptorDescriptor
{
	constructor(
		/** @internal */ readonly config: ManagedAuthenticatedEncryptorConfig,
		/** @internal */ readonly masterKey: ISecret,
	) {}

	exportToXml(): XmlSerializedDescriptorInfo {
		// TODO
		throw new Error('Method not implemented.');
	}
}
