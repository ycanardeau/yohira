import { IHttpContext } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Abstractions/ActionContext.cs,13b3fe63b250cfdc,references
/**
 * Context object for execution of action which has been selected as part of an HTTP request.
 */
export class ActionContext {
	constructor(readonly httpContext: IHttpContext) {}
}
