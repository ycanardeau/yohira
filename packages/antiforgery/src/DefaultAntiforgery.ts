import { IHttpContext } from '@yohira/http.abstractions';

import { IAntiforgery } from './IAntiforgery';

// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/Internal/DefaultAntiforgery.cs,38d318773078c7ae,references
/**
 * Provides access to the antiforgery system, which provides protection against
 * Cross-site Request Forgery (XSRF, also called CSRF) attacks.
 */
export class DefaultAntiforgery implements IAntiforgery {
	validateRequest(httpContext: IHttpContext): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
