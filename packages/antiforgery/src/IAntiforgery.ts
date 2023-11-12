import { IHttpContext } from '@yohira/http.abstractions';

export const IAntiforgery = Symbol.for('IAntiforgery');
// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/IAntiforgery.cs,027c7ffd35313555,references
/**
 * Provides access to the antiforgery system, which provides protection against
 * Cross-site Request Forgery (XSRF, also called CSRF) attacks.
 */
export interface IAntiforgery {
	validateRequest(httpContext: IHttpContext): Promise<void>;
}
