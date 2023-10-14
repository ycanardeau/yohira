import { PropertiesContext } from '@yohira/authentication';
import {
	AuthenticationProperties,
	AuthenticationScheme,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import { CookieOptions } from '@yohira/http.features';

import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';

/**
 * Context object passed to the {@link CookieAuthenticationEvents.signingOut}
 */
export class CookieSigningOutContext extends PropertiesContext<CookieAuthenticationOptions> {
	constructor(
		context: IHttpContext,
		scheme: AuthenticationScheme,
		options: CookieAuthenticationOptions,
		properties: AuthenticationProperties | undefined,
		readonly cookieOptions: CookieOptions,
	) {
		super(context, scheme, options, properties);
	}
}
