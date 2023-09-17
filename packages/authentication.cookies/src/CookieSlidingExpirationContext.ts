import { PrincipalContext } from '@yohira/authentication';
import {
	AuthenticationScheme,
	AuthenticationTicket,
} from '@yohira/authentication.abstractions';
import { TimeSpan } from '@yohira/base';
import { IHttpContext } from '@yohira/http.abstractions';

import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieSlidingExpirationContext.cs,5f3dd1efc7a87238,references
/**
 * Context object passed to the CookieAuthenticationEvents OnCheckSlidingExpiration method.
 */
export class CookieSlidingExpirationContext extends PrincipalContext<CookieAuthenticationOptions> {
	/**
	 * If true, the cookie will be renewed. The initial value will be true if the elapsed time
	 * is greater than the remaining time (e.g. more than 50% expired).
	 */
	shouldRenew = false;

	constructor(
		context: IHttpContext,
		scheme: AuthenticationScheme,
		options: CookieAuthenticationOptions,
		ticket: AuthenticationTicket,
		/**
		 * The amount of time that has elapsed since the cookie was issued or renewed.
		 */
		readonly elapsedTime: TimeSpan,
		/**
		 * The amount of time left until the cookie expires.
		 */
		readonly remainingTime: TimeSpan,
	) {
		super(context, scheme, options, ticket?.properties);
	}
}
