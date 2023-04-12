import { XmlSerializedDescriptorInfo } from './XmlSerializedDescriptorInfo';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ConfigurationModel/IAuthenticatedEncryptorDescriptor.cs,98dd44e4ce16e704,references
export interface IAuthenticatedEncryptorDescriptor {
	exportToXml(): XmlSerializedDescriptorInfo;
}
