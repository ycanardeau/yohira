import { SHA256 } from '@yohira/cryptography';
import { DataProtectionOptions } from '@yohira/data-protection';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { IConfigureOptions, IOptions } from '@yohira/extensions.options';

import { AntiforgeryOptions } from '../AntiforgeryOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/AntiforgeryOptionsSetup.cs,e8ae2e6c9046671d,references
export class AntiforgeryOptionsSetup
	implements IConfigureOptions<AntiforgeryOptions>
{
	private readonly dataProtectionOptions: DataProtectionOptions;

	constructor(
		@inject(Symbol.for('IOptions<DataProtectionOptions>'))
		dataProtectionOptions: IOptions<DataProtectionOptions>,
	) {
		this.dataProtectionOptions = dataProtectionOptions.getValue(
			DataProtectionOptions,
		);
	}

	private static computeCookieName(applicationId: string): string {
		const fullHash = SHA256.hashData(Buffer.from(applicationId));
		return fullHash.toString('base64url', 0, 8);
	}

	configure(options: AntiforgeryOptions): void {
		if (options.cookie.name === undefined) {
			const applicationId =
				this.dataProtectionOptions.appDiscriminator ?? '';
			options.cookie.name =
				AntiforgeryOptions.defaultCookiePrefix +
				AntiforgeryOptionsSetup.computeCookieName(applicationId);
		}
	}
}
