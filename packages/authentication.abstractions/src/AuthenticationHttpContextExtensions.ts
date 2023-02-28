import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticateResult } from './AuthenticateResult';
import { AuthenticationProperties } from './AuthenticationProperties';
import { ClaimsPrincipal } from './ClaimsPrincipal';
import { IAuthenticationService } from './IAuthenticationService';
import { getTokenAsync as getTokenAsyncCore } from './TokenExtensions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationHttpContextExtensions.cs,a8b113fdfa0186ad,references
export function getAuthenticationService(
	context: IHttpContext,
): IAuthenticationService {
	const authenticationService =
		context.requestServices.getService<IAuthenticationService>(
			IAuthenticationService,
		);
	if (authenticationService === undefined) {
		throw new Error(
			`Unable to find the required 'IAuthenticationService' service. Please add all the required services by calling 'IServiceCollection.addAuthentication' in the application startup code.` /* LOC */,
		);
	}
	return authenticationService;
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationHttpContextExtensions.cs,57e86dce1364e9eb,references
/**
 * Authenticate the current request using the specified scheme.
 * @param context The {@link IHttpContext} context.
 * @param scheme The name of the authentication scheme.
 * @returns The {@link AuthenticateResult}.
 */
export function authenticateAsync(
	context: IHttpContext,
	scheme: string | undefined,
): Promise<AuthenticateResult> {
	return getAuthenticationService(context).authenticateAsync(context, scheme);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationHttpContextExtensions.cs,c79499913448b520,references
/**
 * Challenge the current request using the specified scheme.
 * An authentication challenge can be issued when an unauthenticated user requests an endpoint that requires authentication.
 * @param context The {@link IHttpContext} context.
 * @param scheme The name of the authentication scheme.
 * @param properties The {@link AuthenticationProperties} properties.
 * @returns The promise.
 */
export function challengeAsync(
	context: IHttpContext,
	scheme: string | undefined,
	properties: AuthenticationProperties | undefined,
): Promise<void> {
	return getAuthenticationService(context).challengeAsync(
		context,
		scheme,
		properties,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationHttpContextExtensions.cs,add278766185f86c,references
/**
 * Forbid the current request using the specified scheme.
 * Forbid is used when an authenticated user attempts to access a resource they are not permitted to access.
 * @param context The {@link IHttpContext} context.
 * @param scheme The name of the authentication scheme.
 * @param properties The {@link AuthenticationProperties} properties.
 * @returns The promise.
 */
export function forbidAsync(
	context: IHttpContext,
	scheme: string | undefined,
	properties: AuthenticationProperties | undefined,
): Promise<void> {
	return getAuthenticationService(context).forbidAsync(
		context,
		scheme,
		properties,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationHttpContextExtensions.cs,6345a49590e590de,references
/**
 * Sign in a principal for the specified scheme.
 * @param context The {@link IHttpContext} context.
 * @param scheme The name of the authentication scheme.
 * @param principal The user.
 * @param properties The {@link AuthenticationProperties} properties.
 * @returns The promise.
 */
export function signInAsync(
	context: IHttpContext,
	scheme: string | undefined,
	principal: ClaimsPrincipal,
	properties: AuthenticationProperties | undefined,
): Promise<void> {
	return getAuthenticationService(context).signInAsync(
		context,
		scheme,
		principal,
		properties,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationHttpContextExtensions.cs,7cb8c20495e6d4b8,references
/**
 * Sign out a principal for the specified scheme.
 * @param context The {@link IHttpContext} context.
 * @param scheme The name of the authentication scheme.
 * @param properties The {@link AuthenticationProperties} properties.
 * @returns The promise.
 */
export function signOutAsync(
	context: IHttpContext,
	scheme: string | undefined,
	properties: AuthenticationProperties | undefined,
): Promise<void> {
	return getAuthenticationService(context).signOutAsync(
		context,
		scheme,
		properties,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationHttpContextExtensions.cs,8525c22bba9d3e44,references
/**
 * Authenticates the request using the specified scheme and returns the value for the token.
 * @param context The {@link IHttpContext} context.
 * @param scheme The name of the authentication scheme.
 * @param tokenName The name of the token.
 * @returns The value of the token if present.
 */
export function getTokenAsync(
	context: IHttpContext,
	scheme: string | undefined,
	tokenName: string,
): Promise<string | undefined> {
	return getTokenAsyncCore(
		getAuthenticationService(context),
		context,
		scheme,
		tokenName,
	);
}
