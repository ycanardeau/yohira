import {
	AuthenticationProperties,
	IAuthenticationSignInHandler,
	signIn,
} from '@yohira/authentication.abstractions';
import { ClaimsPrincipal, Ctor } from '@yohira/base';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
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
		logger: ILoggerFactory,
	) {
		super(optionsCtor, optionsMonitor, logger);
	}

	/**
	 * Override this method to handle signIn.
	 * @param user
	 * @param properties
	 * @returns A promise.
	 */
	protected abstract handleSignIn(
		user: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
	): Promise<void>;

	signIn(
		user: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
	): Promise<void> {
		const target = this.resolveTarget(this.options.forwardSignIn);
		return target !== undefined
			? signIn(this.context, target, user, properties)
			: this.handleSignIn(
					user,
					properties ?? AuthenticationProperties.create(),
				);
	}
}
