import { TicketDataFormat } from '@yohira/authentication';
import {
	IDataProtectionProvider,
	createProtectorWithPurposeAndSubPurposes,
} from '@yohira/data-protection.abstractions';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { IPostConfigureOptions } from '@yohira/extensions.options';

import { ChunkingCookieManager } from './ChunkingCookieManager';
import { CookieAuthenticationDefaults } from './CookieAuthenticationDefaults';
import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/PostConfigureCookieAuthenticationOptions.cs,fff1afd2c2362e7f,references
/**
 * Used to setup defaults for all {@link CookieAuthenticationOptions}.
 */
export class PostConfigureCookieAuthenticationOptions
	implements IPostConfigureOptions<CookieAuthenticationOptions>
{
	constructor(
		@inject(IDataProtectionProvider)
		private readonly dp: IDataProtectionProvider,
	) {}

	postConfigure(name: string, options: CookieAuthenticationOptions): void {
		options.dataProtectionProvider ??= this.dp;

		if (name === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}

		if (!options.cookie.name) {
			options.cookie.name =
				CookieAuthenticationDefaults.cookiePrefix +
				encodeURIComponent(name);
		}
		if (options.ticketDataFormat === undefined) {
			// Note: the purpose for the data protector must remain fixed for interop to work.
			const dataProtector = createProtectorWithPurposeAndSubPurposes(
				options.dataProtectionProvider!,
				'@yohira/authentication.cookies/CookieAuthenticationMiddleware',
				name,
				'v2',
			);
			options.ticketDataFormat = new TicketDataFormat(dataProtector);
		}
		if (options.cookieManager === undefined) {
			options.cookieManager = new ChunkingCookieManager();
		}
		/* TODO: if (!options.loginPath.hasValue) {
			// TODO
			throw new Error('Method not implemented.');
		}
		if (!options.logoutPath.hasValue) {
			// TODO
			throw new Error('Method not implemented.');
		}
		if (options.accessDeniedPath.hasValue) {
			// TODO
			throw new Error('Method not implemented.');
		} */
	}
}
