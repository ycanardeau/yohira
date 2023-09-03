import { PrincipalContext } from '@yohira/authentication';
import {
	AuthenticationProperties,
	AuthenticationScheme,
	ClaimsPrincipal,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import { CookieOptions } from '@yohira/http.features';

import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieSigningInContext.cs,11d0ffd5b68b7fbd,references
/**
 * Context object passed to the {@link CookieAuthenticationEvents.signingIn}.
 */
export class CookieSigningInContext extends PrincipalContext<CookieAuthenticationOptions> {
	constructor(
		context: IHttpContext,
		scheme: AuthenticationScheme,
		options: CookieAuthenticationOptions,
		principal: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
		/**
		 * The options for creating the outgoing cookie.
		 * May be replace or altered during the SigningIn call.
		 */
		readonly cookieOptions: CookieOptions,
	) {
		super(context, scheme, options, properties);

		this.principal = principal;
	}
}
