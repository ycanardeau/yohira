import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';

import { ISecret } from '../ISecret';
import { AuthenticatedEncryptorConfig } from '../authenticated-encryption/conifg-model/AuthenticatedEncryptorConfig';
import { IKey } from '../key-management/IKey';
import { IAuthenticatedEncryptor } from './IAuthenticatedEncryptor';
import { IAuthenticatedEncryptorFactory } from './IAuthenticatedEncryptorFactory';
import { ManagedAuthenticatedEncryptorFactory } from './ManagedAuthenticatedEncryptorFactory';
import { AuthenticatedEncryptorDescriptor } from './conifg-model/AuthenticatedEncryptorDescriptor';
import { ManagedAuthenticatedEncryptorConfig } from './conifg-model/ManagedAuthenticatedEncryptorConfig';

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

		if (false /* TODO: */) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			if (false /* TODO */) {
				// TODO
				throw new Error('Method not implemented.');
			} else {
				// Use managed implementations as a fallback
				const config = new ManagedAuthenticatedEncryptorConfig();
				// TODO

				return new ManagedAuthenticatedEncryptorFactory(
					this.loggerFactory,
				).createAuthenticatedEncryptorInstance(secret, config);
			}
		}
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
