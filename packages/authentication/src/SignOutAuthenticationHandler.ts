import {
	AuthenticationProperties,
	IAuthenticationSignOutHandler,
} from '@yohira/authentication.abstractions';
import { Ctor } from '@yohira/base';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { IOptionsMonitor } from '@yohira/extensions.options';

import { AuthenticationHandler } from './AuthenticationHandler';
import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/SignOutAuthenticationHandler.cs,4a9f0e7cda5cb3c9,references
/**
 * Adds support for signOut
 */
export abstract class SignOutAuthenticationHandler<
		TOptions extends AuthenticationSchemeOptions,
	>
	extends AuthenticationHandler<TOptions>
	implements IAuthenticationSignOutHandler
{
	constructor(
		optionsCtor: Ctor<TOptions>,
		optionsMonitor: IOptionsMonitor<TOptions>,
		logger: ILoggerFactory,
	) {
		super(optionsCtor, optionsMonitor, logger);
	}

	signOut(properties: AuthenticationProperties | undefined): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
