import { tryGetValue } from '@yohira/base';
import { IHttpContext } from '@yohira/http.abstractions';

import { AuthenticationProperties } from './AuthenticationProperties';
import { IAuthenticationService } from './IAuthenticationService';

const tokenKeyPrefix = '.Token.';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/TokenExtensions.cs,9f2e539b202226f8,references
export function getTokenValue(
	properties: AuthenticationProperties,
	tokenName: string,
): string | undefined {
	const tokenKey = tokenKeyPrefix + tokenName;

	const tryGetValueResult = tryGetValue(properties.items, tokenKey);
	return tryGetValueResult.ok ? tryGetValueResult.val : undefined;
}

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/TokenExtensions.cs,936de6e92fd0132e,references
/**
 * Authenticates the request using the specified authentication scheme and returns the value for the token.
 * @param auth The {@link IAuthenticationService}.
 * @param context The {@link IHttpContext} context.
 * @param scheme The name of the authentication scheme.
 * @param tokenName The name of the token.
 * @returns The value of the token if present.
 */
export async function getTokenAsync(
	auth: IAuthenticationService,
	context: IHttpContext,
	scheme: string | undefined,
	tokenName: string,
): Promise<string | undefined> {
	const result = await auth.authenticateAsync(context, scheme);
	return result?.properties !== undefined
		? getTokenValue(result.properties, tokenName)
		: undefined;
}
