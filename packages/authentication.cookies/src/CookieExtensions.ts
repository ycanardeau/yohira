import { AuthenticationBuilder } from '@yohira/authentication';

import { CookieAuthenticationDefaults } from './CookieAuthenticationDefaults';
import { CookieAuthenticationOptions } from './CookieAuthenticationOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieExtensions.cs,71e486317ee59c4f,references
export function addCookie(
	builder: AuthenticationBuilder,
	authenticationScheme: string = CookieAuthenticationDefaults.authenticationScheme,
	displayName: string | undefined = undefined,
	configureOptions: (
		options: CookieAuthenticationOptions,
	) => void = undefined!,
): AuthenticationBuilder {
	// TODO
	throw new Error('Method not implemented.');
}
