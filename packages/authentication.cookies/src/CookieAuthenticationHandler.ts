import { SignInAuthenticationHandler } from '@yohira/authentication';
import { AuthenticateResult } from '@yohira/authentication.abstractions';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
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
		@inject(ILoggerFactory) logger: ILoggerFactory,
	) {
		super(CookieAuthenticationOptions, optionsMonitor, logger);
	}

	protected handleAuthenticate(): Promise<AuthenticateResult> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
