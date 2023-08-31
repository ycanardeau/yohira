import {
	AuthenticateResult,
	AuthenticationProperties,
	AuthenticationScheme,
	IAuthenticationHandler,
} from '@yohira/authentication.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticationSchemeOptions } from './AuthenticationSchemeOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationHandler.cs,eda9767974277610,references
/**
 * An opinionated abstraction for implementing <see cref="IAuthenticationHandler"/>.
 */
export abstract class AuthenticationHandler<
	TOptions extends AuthenticationSchemeOptions,
> implements IAuthenticationHandler
{
	initialize(
		scheme: AuthenticationScheme,
		context: IHttpContext,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	authenticate(): Promise<AuthenticateResult> {
		// TODO
		throw new Error('Method not implemented.');
	}

	challenge(properties: AuthenticationProperties | undefined): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	forbid(properties: AuthenticationProperties | undefined): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
