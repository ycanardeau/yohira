import { AuthenticationScheme } from './AuthenticationScheme';

export const IAuthenticationSchemeProvider = Symbol.for(
	'IAuthenticationSchemeProvider',
);
// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticationSchemeProvider.cs,ed6420a6ba003839,references
/**
 * Responsible for managing what authenticationSchemes are supported.
 */
export interface IAuthenticationSchemeProvider {
	/**
	 * Returns the scheme that will be used by default for {@link IAuthenticationService.authenticate}.
	 * This is typically specified via {@link AuthenticationOptions.defaultAuthenticateScheme}.
	 * Otherwise, this will fallback to {@link AuthenticationOptions.defaultScheme}.
	 * @returns The scheme that will be used by default for {@link IAuthenticationService.authenticate}.
	 */
	getDefaultAuthenticateScheme(): Promise<AuthenticationScheme | undefined>;

	/**
	 * Returns the schemes in priority order for request handling.
	 * @returns The schemes in priority order for request handling
	 */
	getRequestHandlerSchemes(): Promise<Iterable<AuthenticationScheme>>;
}
