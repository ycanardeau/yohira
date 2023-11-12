import { IHttpContext } from '@yohira/http.abstractions';

import { AntiforgeryToken } from './AntiforgeryToken';

export const IAntiforgeryTokenGenerator = Symbol.for(
	'IAntiforgeryTokenGenerator',
);
// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/IAntiforgeryTokenGenerator.cs,f7eff841132403ba,references
/**
 * Generates and validates antiforgery tokens.
 */
export interface IAntiforgeryTokenGenerator {
	/**
	 * Generates a new random cookie token.
	 * @returns An {@link AntiforgeryToken}.
	 */
	generateCookieToken(): AntiforgeryToken;
	/**
	 * Generates a request token corresponding to {@link cookieToken}.
	 * @param httpContext The {@link IHttpContext} associated with the current request.
	 * @param cookieToken A valid cookie token.
	 */
	generateRequestToken(
		httpContext: IHttpContext,
		cookieToken: AntiforgeryToken,
	): AntiforgeryToken;
	/**
	 * Attempts to validate a cookie token.
	 * @param cookieToken A valid cookie token.
	 * @returns <c>true</c> if the cookie token is valid, otherwise <c>false</c>.
	 */
	isCookieTokenValid(cookieToken: AntiforgeryToken | undefined): boolean;
}
