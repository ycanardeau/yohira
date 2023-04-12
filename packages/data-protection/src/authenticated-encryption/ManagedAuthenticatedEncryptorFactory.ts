import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';

import { ISecret } from '../ISecret';
import { IKey } from '../key-management/IKey';
import { ManagedAuthenticatedEncryptor } from '../managed/ManagedAuthenticatedEncryptor';
import { IAuthenticatedEncryptor } from './IAuthenticatedEncryptor';
import { IAuthenticatedEncryptorFactory } from './IAuthenticatedEncryptorFactory';
import { ManagedAuthenticatedEncryptorConfig } from './conifg-model/ManagedAuthenticatedEncryptorConfig';
import { ManagedAuthenticatedEncryptorDescriptor } from './conifg-model/ManagedAuthenticatedEncryptorDescriptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ManagedAuthenticatedEncryptorFactory.cs,a9f09a66f04a8986,references
export class ManagedAuthenticatedEncryptorFactory
	implements IAuthenticatedEncryptorFactory
{
	constructor(loggerFactory: ILoggerFactory) {}

	/** @internal */ createAuthenticatedEncryptorInstance(
		secret: ISecret,
		config: ManagedAuthenticatedEncryptorConfig | undefined,
	): ManagedAuthenticatedEncryptor | undefined {
		if (config === undefined) {
			return undefined;
		}

		return new ManagedAuthenticatedEncryptor(/* TODO */);
	}

	createEncryptorInstance(key: IKey): IAuthenticatedEncryptor | undefined {
		if (
			!(key.descriptor instanceof ManagedAuthenticatedEncryptorDescriptor)
		) {
			return undefined;
		}

		return this.createAuthenticatedEncryptorInstance(
			key.descriptor.masterKey,
			key.descriptor.config,
		);
	}
}
