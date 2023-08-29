import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticateResult } from './AuthenticateResult';
import { AuthenticationProperties } from './AuthenticationProperties';
import { AuthenticationScheme } from './AuthenticationScheme';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticationHandler.cs,8dcd31e3d889e7a3,references
/**
 * Created per request to handle authentication for a particular scheme.
 */
export interface IAuthenticationHandler {
	/**
	 * Initialize the authentication handler. The handler should initialize anything it needs from the request and scheme as part of this method.
	 * @param scheme The {@link AuthenticationScheme} scheme.
	 * @param context The {@link IHttpContext} context.
	 */
	initialize(
		scheme: AuthenticationScheme,
		context: IHttpContext,
	): Promise<void>;

	/**
	 * Authenticate the current request.
	 * @returns The {@link AuthenticateResult} result.
	 */
	authenticate(): Promise<AuthenticateResult>;

	/**
	 * Challenge the current request.
	 * @param properties The {@link AuthenticationProperties} that contains the extra meta-data arriving with the authentication.
	 */
	challenge(properties: AuthenticationProperties | undefined): Promise<void>;

	/**
	 * Forbid the current request.
	 * @param properties The {@link AuthenticationProperties} that contains the extra meta-data arriving with the authentication.
	 */
	forbid(properties: AuthenticationProperties | undefined): Promise<void>;
}
