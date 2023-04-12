import { ISecret } from '../../ISecret';
import { AuthenticatedEncryptorConfig } from './AuthenticatedEncryptorConfig';
import { IAuthenticatedEncryptorDescriptor } from './IAuthenticatedEncryptorDescriptor';
import { XmlSerializedDescriptorInfo } from './XmlSerializedDescriptorInfo';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ConfigurationModel/AuthenticatedEncryptorDescriptor.cs,6d392486f4636800,references
export class AuthenticatedEncryptorDescriptor
	implements IAuthenticatedEncryptorDescriptor
{
	constructor(
		/** @internal */ public config: AuthenticatedEncryptorConfig,
		/** @internal */ public masterKey: ISecret,
	) {}

	exportToXml(): XmlSerializedDescriptorInfo {
		// <descriptor>
		//   <encryption algorithm="..." />
		//   <validation algorithm="..." /> <!-- only if not GCM -->
		//   <masterKey requiresEncryption="true">...</masterKey>
		// </descriptor>

		/* TODO: const encryptionElement = XElement.fromName(XName.get('encryption'));
		encryptionElement.content = new XAttribute(
			XName.get('algorithm'),
			EncryptionAlgorithm[this.config.encryptionAlgorithm],
		); */

		// TODO

		/* TODO: const outerElement = XElement.fromName(XName.get('descriptor'));
		outerElement.content = [
			encryptionElement,
			// TODO: validationElement,
			// TODO: toMasterKeyElement(masterKey),
		]; */
		return new XmlSerializedDescriptorInfo(/* TODO: outerElement, AuthenticatedEncryptorDescriptorDeserializer */);
	}
}
