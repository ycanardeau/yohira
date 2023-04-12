import { IAuthenticatedEncryptorDescriptor } from './IAuthenticatedEncryptorDescriptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ConfigurationModel/AlgorithmConfiguration.cs,d583e89bfeed511a,references
export abstract class AlgorithmConfig {
	/** @internal */ static readonly KDK_SIZE_IN_BYTES = 512 / 8;

	abstract createNewDescriptor(): IAuthenticatedEncryptorDescriptor;
}
