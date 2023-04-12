import { ISecret } from '../../ISecret';
import { IAuthenticatedEncryptorDescriptor } from './IAuthenticatedEncryptorDescriptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ConfigurationModel/IInternalAlgorithmConfiguration.cs,20e90f86a63d5b32,references
export interface IInternalAlgorithmConfig {
	createDescriptorFromSecret(
		secret: ISecret,
	): IAuthenticatedEncryptorDescriptor;
}
