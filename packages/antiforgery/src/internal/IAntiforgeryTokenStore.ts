import { IHttpContext } from '@yohira/http.abstractions';

import { AntiforgeryTokenSet } from '../AntiforgeryTokenSet';

export const IAntiforgeryTokenStore = Symbol.for('IAntiforgeryTokenStore');
// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/IAntiforgeryTokenStore.cs,7d04e2896adab8ed
export interface IAntiforgeryTokenStore {
	getCookieToken(httpContext: IHttpContext): string | undefined;
	/**
	 * Gets the cookie and request tokens from the request.
	 * @param httpContext The {@link IHttpContext} for the current request.
	 * @returns The {@link AntiforgeryTokenSet}.
	 */
	getRequestTokens(httpContext: IHttpContext): Promise<AntiforgeryTokenSet>;
	saveCookieToken(httpContext: IHttpContext, token: string): void;
}
