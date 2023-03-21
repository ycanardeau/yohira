import { IAuthenticatedEncryptorDescriptor } from '../IAuthenticatedEncryptorDescriptor';

export abstract class AlgorithmConfig {
	/** @internal */ static readonly KDK_SIZE_IN_BYTES = 512 / 8;

	abstract createNewDescriptor(): IAuthenticatedEncryptorDescriptor;
}
