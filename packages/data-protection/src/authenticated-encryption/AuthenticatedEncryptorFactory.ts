import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';

import { ISecret } from '../ISecret';
import { AuthenticatedEncryptorConfig } from '../authenticated-encryption/conifg-model/AuthenticatedEncryptorConfig';
import { IKey } from '../key-management/IKey';
import { IAuthenticatedEncryptor } from './IAuthenticatedEncryptor';
import { IAuthenticatedEncryptorFactory } from './IAuthenticatedEncryptorFactory';
import { AuthenticatedEncryptorDescriptor } from './conifg-model/AuthenticatedEncryptorDescriptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/AuthenticatedEncryptorFactory.cs,ec529f4556c2b2ae,references
export class AuthenticatedEncryptorFactory
	implements IAuthenticatedEncryptorFactory
{
	constructor(private readonly loggerFactory: ILoggerFactory) {}

	/** @internal */ createAuthenticatedEncryptorInstance(
		secret: ISecret,
		authenticatedConfig: AuthenticatedEncryptorConfig | undefined,
	): IAuthenticatedEncryptor | undefined {
		if (authenticatedConfig === undefined) {
			return undefined;
		}

		// TODO
		//throw new Error('Method not implemented.');
		return undefined;
	}

	createEncryptorInstance(key: IKey): IAuthenticatedEncryptor | undefined {
		if (!(key.descriptor instanceof AuthenticatedEncryptorDescriptor)) {
			return undefined;
		}

		return this.createAuthenticatedEncryptorInstance(
			key.descriptor.masterKey,
			key.descriptor.config,
		);
	}
}
