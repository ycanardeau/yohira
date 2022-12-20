import { IHttpRequest } from '@yohira/http.abstractions/IHttpRequest';
import { IHttpResponse } from '@yohira/http.abstractions/IHttpResponse';
import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpContext.cs,9bde6e3833d169c1,references
export interface IHttpContext {
	/**
	 * Gets the {@link IHttpRequest} object for this request.
	 */
	readonly request: IHttpRequest;
	/**
	 * Gets the {@link IHttpResponse} object for this request.
	 */
	readonly response: IHttpResponse;
	requestServices: Container;
}
