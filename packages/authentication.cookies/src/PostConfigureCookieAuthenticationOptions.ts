import { IPostConfigureOptions } from '@yohira/extensions.options';

import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';

/**
 * Used to setup defaults for all {@link CookieAuthenticationOptions}.
 */
export class PostConfigureCookieAuthenticationOptions
	implements IPostConfigureOptions<CookieAuthenticationOptions>
{
	postConfigure(
		name: string | undefined,
		options: CookieAuthenticationOptions,
	): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
