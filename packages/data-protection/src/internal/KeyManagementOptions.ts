import { IConfigureOptions } from '@yohira/extensions.options';

import { AuthenticatedEncryptorConfig } from '../authenticated-encryption/conifg-model/AuthenticatedEncryptorConfig';
import { KeyManagementOptions } from '../key-management/KeyManagementOptions';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Internal/KeyManagementOptionsSetup.cs,de8670eb14f54ba6,references
export class KeyManagementOptionsSetup
	implements IConfigureOptions<KeyManagementOptions>
{
	configure(options: KeyManagementOptions): void {
		// TODO
		//throw new Error('Method not implemented.');

		if (options.authenticatedEncryptorConfig === undefined) {
			options.authenticatedEncryptorConfig =
				new AuthenticatedEncryptorConfig();
		}

		// TODO
		//throw new Error('Method not implemented.');
	}
}
