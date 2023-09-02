import { PrincipalContext } from '@yohira/authentication';
import {
	AuthenticationScheme,
	AuthenticationTicket,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieValidatePrincipalContext.cs,0369e1b2ee4fec81,references
/**
 * Context object passed to the CookieAuthenticationEvents ValidatePrincipal method.
 */
export class CookieValidatePrincipalContext extends PrincipalContext<CookieAuthenticationOptions> {
	/**
	 * If true, the cookie will be renewed
	 */
	shouldRenew = false;

	constructor(
		context: IHttpContext,
		scheme: AuthenticationScheme,
		options: CookieAuthenticationOptions,
		ticket: AuthenticationTicket,
	) {
		super(context, scheme, options, ticket?.properties);

		this.principal = ticket.principal;
	}
}
