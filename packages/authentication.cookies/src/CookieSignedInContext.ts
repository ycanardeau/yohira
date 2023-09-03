import { PrincipalContext } from '@yohira/authentication';
import {
	AuthenticationProperties,
	AuthenticationScheme,
	ClaimsPrincipal,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieSignedInContext.cs,6eb0bfe311550aa6,references
/**
 * Context object passed to the ICookieAuthenticationEvents method signedIn.
 */
export class CookieSignedInContext extends PrincipalContext<CookieAuthenticationOptions> {
	/**
	 * Creates a new instance of the context object.
	 * @param context The HTTP request context
	 * @param scheme The scheme data
	 * @param principal Initializes Principal property
	 * @param properties Initializes Properties property
	 * @param options The handler options
	 */
	constructor(
		context: IHttpContext,
		scheme: AuthenticationScheme,
		principal: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
		options: CookieAuthenticationOptions,
	) {
		super(context, scheme, options, properties);

		this.principal = principal;
	}
}
