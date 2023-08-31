import { IAuthenticationSchemeProvider } from '@yohira/authentication.abstractions';
import {
	IHttpContext,
	IMiddleware,
	RequestDelegate,
} from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationMiddleware.cs,20a6e8d8983fbe5c,references
/**
 * Middleware that performs authentication.
 */
export class AuthenticationMiddleware implements IMiddleware {
	constructor(
		private readonly next: RequestDelegate,
		readonly schemes: IAuthenticationSchemeProvider,
	) {}

	invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
