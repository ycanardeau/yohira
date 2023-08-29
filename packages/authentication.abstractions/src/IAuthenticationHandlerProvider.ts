import { IHttpContext } from '@yohira/http.abstractions';

import { IAuthenticationHandler } from './IAuthenticationHandler';

export const IAuthenticationHandlerProvider = Symbol.for(
	'IAuthenticationHandlerProvider',
);
// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticationHandlerProvider.cs,6f7e408560f806ae,references
/**
 * Provides the appropriate IAuthenticationHandler instance for the authenticationScheme and request.
 */
export interface IAuthenticationHandlerProvider {
	/**
	 * Returns the handler instance that will be used.
	 * @param context The {@link IHttpContext}.
	 * @param authenticationScheme The name of the authentication scheme being handled.
	 * @returns The handler instance.
	 */
	getHandler(
		context: IHttpContext,
		authenticationScheme: string,
	): Promise<IAuthenticationHandler | undefined>;
}
