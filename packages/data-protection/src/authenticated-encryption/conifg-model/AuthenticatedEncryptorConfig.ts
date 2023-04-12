import { ISecret } from '../../ISecret';
import { Secret } from '../../Secret';
import { EncryptionAlgorithm } from '../EncryptionAlgorithm';
import { AlgorithmConfig } from './AlgorithmConfig';
import { AuthenticatedEncryptorDescriptor } from './AuthenticatedEncryptorDescriptor';
import { IAuthenticatedEncryptorDescriptor } from './IAuthenticatedEncryptorDescriptor';
import { IInternalAlgorithmConfig } from './IInternalAlgorithmConfig';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ConfigurationModel/AuthenticatedEncryptorConfiguration.cs,b0889cc3ce35698d,references
export class AuthenticatedEncryptorConfig
	extends AlgorithmConfig
	implements IInternalAlgorithmConfig
{
	encryptionAlgorithm = EncryptionAlgorithm.AES_256_CBC;

	createDescriptorFromSecret(
		secret: ISecret,
	): IAuthenticatedEncryptorDescriptor {
		return new AuthenticatedEncryptorDescriptor(this, secret);
	}

	createNewDescriptor(): IAuthenticatedEncryptorDescriptor {
		const internalConfig = this as IInternalAlgorithmConfig;
		return internalConfig.createDescriptorFromSecret(
			Secret.random(AlgorithmConfig.KDK_SIZE_IN_BYTES),
		);
	}
}
