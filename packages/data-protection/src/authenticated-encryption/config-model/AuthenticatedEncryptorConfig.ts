import { ISecret } from '../../ISecret';
import { Secret } from '../../Secret';
import { IAuthenticatedEncryptorDescriptor } from '../IAuthenticatedEncryptorDescriptor';
import { AlgorithmConfig } from './AlgorithmConfig';
import { AuthenticatedEncryptorDescriptor } from './AuthenticatedEncryptorDescriptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ConfigurationModel/AuthenticatedEncryptorConfiguration.cs,b0889cc3ce35698d,references
export class AuthenticatedEncryptorConfig extends AlgorithmConfig /* TODO: implements IInternalAlgorithmConfig */ {
	createDescriptorFromSecret(
		secret: ISecret,
	): IAuthenticatedEncryptorDescriptor {
		return new AuthenticatedEncryptorDescriptor(this, secret);
	}

	createNewDescriptor(): IAuthenticatedEncryptorDescriptor {
		return this.createDescriptorFromSecret(
			Secret.random(AlgorithmConfig.KDK_SIZE_IN_BYTES),
		);
	}
}
