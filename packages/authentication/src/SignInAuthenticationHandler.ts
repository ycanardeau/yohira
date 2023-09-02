// https://source.dot.net/#Microsoft.AspNetCore.Authentication/SignInAuthenticationHandler.cs,77748843e5c93c81,references
import {
	AuthenticationProperties,
	ClaimsPrincipal,
	IAuthenticationSignInHandler,
} from '@yohira/authentication.abstractions';
import { Ctor } from '@yohira/base';
import { IOptionsMonitor } from '@yohira/extensions.options';

import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';
import { SignOutAuthenticationHandler } from './SignOutAuthenticationHandler';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/SignInAuthenticationHandler.cs,77748843e5c93c81,references
/**
 * Adds support for signIn
 */
export abstract class SignInAuthenticationHandler<
		TOptions extends AuthenticationSchemeOptions,
	>
	extends SignOutAuthenticationHandler<TOptions>
	implements IAuthenticationSignInHandler
{
	constructor(
		optionsCtor: Ctor<TOptions>,
		optionsMonitor: IOptionsMonitor<TOptions>,
	) {
		super(optionsCtor, optionsMonitor);
	}

	signIn(
		user: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
