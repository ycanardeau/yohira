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
	 * Returns all currently registered {@link AuthenticationScheme}s.
	 * @returns All currently registered {@link AuthenticationScheme}s.
	 */
	getAllSchemes(): Promise<Iterable<AuthenticationScheme>>;

	/**
	 * Returns the {@link AuthenticationScheme} matching the name, or undefined.
	 * @param name The name of the authenticationScheme.
	 * @returns The scheme or null if not found.
	 */
	getScheme(name: string): Promise<AuthenticationScheme | undefined>;

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

	/**
	 * Returns the scheme that will be used by default for {@link IAuthenticationService.signIn}.
	 * This is typically specified via {@link AuthenticationOptions.defaultSignInScheme}.
	 * Otherwise, this will fallback to {@link AuthenticationOptions.defaultScheme}.
	 * @returns The scheme that will be used by default for {@link IAuthenticationService.signIn}.
	 */
	getDefaultSignInScheme(): Promise<AuthenticationScheme | undefined>;

	/**
	 * Returns the scheme that will be used by default for {@link IAuthenticationService.signOut}.
	 * This is typically specified via {@link AuthenticationOptions.defaultSignOutScheme}.
	 * Otherwise, this will fallback to {@link getDefaultSignInScheme} .
	 * @returns The scheme that will be used by default for {@link IAuthenticationService.signOut}.
	 */
	getDefaultSignOutScheme(): Promise<AuthenticationScheme | undefined>;
}
