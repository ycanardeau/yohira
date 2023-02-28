import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticateResult } from './AuthenticateResult';
import { AuthenticationProperties } from './AuthenticationProperties';
import { ClaimsPrincipal } from './ClaimsPrincipal';

export const IAuthenticationService = Symbol.for('IAuthenticationService');
// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticationService.cs,193a6854fd42527a,references
/**
 * Used to provide authentication.
 */
export interface IAuthenticationService {
	/**
	 * Authenticate for the specified authentication scheme.
	 * @param context The {@link IHttpContext}.
	 * @param scheme The name of the authentication scheme.
	 * @returns The result.
	 */
	authenticateAsync(
		context: IHttpContext,
		scheme: string | undefined,
	): Promise<AuthenticateResult>;
	/**
	 * Challenge the specified authentication scheme.
	 * An authentication challenge can be issued when an unauthenticated user requests an endpoint that requires authentication.
	 * @param context The {@link IHttpContext}.
	 * @param scheme The name of the authentication scheme.
	 * @param properties The {@link AuthenticationProperties}.
	 * @returns A promise.
	 */
	challengeAsync(
		context: IHttpContext,
		scheme: string | undefined,
		properties: AuthenticationProperties | undefined,
	): Promise<void>;
	/**
	 * Forbids the specified authentication scheme.
	 * Forbid is used when an authenticated user attempts to access a resource they are not permitted to access.
	 * @param context The {@link HttpContext}.
	 * @param scheme The name of the authentication scheme.
	 * @param properties The {@link AuthenticationProperties}.
	 * @returns A promise.
	 */
	forbidAsync(
		context: IHttpContext,
		scheme: string | undefined,
		properties: AuthenticationProperties | undefined,
	): Promise<void>;
	/**
	 * Sign a principal in for the specified authentication scheme.
	 * @param context The {@link IHttpContext}.
	 * @param scheme The name of the authentication scheme.
	 * @param principal The {@link ClaimsPrincipal} to sign in.
	 * @param properties The {@link AuthenticationProperties}.
	 * @returns A promise.
	 */
	signInAsync(
		context: IHttpContext,
		scheme: string | undefined,
		principal: ClaimsPrincipal,
		properties: AuthenticationProperties | undefined,
	): Promise<void>;
	/**
	 * Sign out the specified authentication scheme.
	 * @param context The {@link IHttpContext}.
	 * @param scheme The name of the authentication scheme.
	 * @param properties The {@link AuthenticationProperties}.
	 * @returns A promise.
	 */
	signOutAsync(
		context: IHttpContext,
		scheme: string | undefined,
		properties: AuthenticationProperties | undefined,
	): Promise<void>;
}
