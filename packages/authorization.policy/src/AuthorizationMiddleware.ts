import {
	IHttpContext,
	IMiddleware,
	RequestDelegate,
} from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authorization.Policy/AuthorizationMiddleware.cs,c30aadcbabb742a6,references
/**
 * A middleware that enables authorization capabilities.
 */
export class AuthorizationMiddleware implements IMiddleware {
	invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
