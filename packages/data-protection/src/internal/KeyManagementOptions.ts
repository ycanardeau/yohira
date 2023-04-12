import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { IConfigureOptions } from '@yohira/extensions.options';

import { AuthenticatedEncryptorFactory } from '../authenticated-encryption/AuthenticatedEncryptorFactory';
import { ManagedAuthenticatedEncryptorFactory } from '../authenticated-encryption/ManagedAuthenticatedEncryptorFactory';
import { AuthenticatedEncryptorConfig } from '../authenticated-encryption/conifg-model/AuthenticatedEncryptorConfig';
import { KeyManagementOptions } from '../key-management/KeyManagementOptions';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Internal/KeyManagementOptionsSetup.cs,de8670eb14f54ba6,references
export class KeyManagementOptionsSetup
	implements IConfigureOptions<KeyManagementOptions>
{
	constructor(
		@inject(ILoggerFactory) private readonly loggerFactory: ILoggerFactory,
	) {}

	configure(options: KeyManagementOptions): void {
		// TODO
		//throw new Error('Method not implemented.');

		if (options.authenticatedEncryptorConfig === undefined) {
			options.authenticatedEncryptorConfig =
				new AuthenticatedEncryptorConfig();
		}

		// TODO
		//throw new Error('Method not implemented.');

		// TODO
		options.authenticatedEncryptorFactories.add(
			new ManagedAuthenticatedEncryptorFactory(this.loggerFactory),
		);
		options.authenticatedEncryptorFactories.add(
			new AuthenticatedEncryptorFactory(this.loggerFactory),
		);
	}
}
