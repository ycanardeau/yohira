import { SignInAuthenticationHandler } from '@yohira/authentication';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { IOptionsMonitor } from '@yohira/extensions.options';

import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieAuthenticationHandler.cs,54c4e5158289a976,references
/**
 * Implementation for the cookie-based authentication handler.
 */
export class CookieAuthenticationHandler extends SignInAuthenticationHandler<CookieAuthenticationOptions> {
	constructor(
		@inject(Symbol.for(`IOptionsMonitor<CookieAuthenticationOptions>`))
		optionsMonitor: IOptionsMonitor<CookieAuthenticationOptions>,
	) {
		super(CookieAuthenticationOptions, optionsMonitor);
	}
}
