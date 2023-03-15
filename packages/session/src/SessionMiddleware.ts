import {
	IHttpContext,
	IMiddleware,
	RequestDelegate,
} from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Session/SessionMiddleware.cs,4e889e4f5c92c52f,references
export class SessionMiddleware implements IMiddleware {
	invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
