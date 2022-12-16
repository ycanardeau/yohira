import { IHttpRequest } from '@/http.abstractions/IHttpRequest';
import { IHttpResponse } from '@/http.abstractions/IHttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpContext.cs,9bde6e3833d169c1,references
export interface IHttpContext {
	readonly request: IHttpRequest;
	readonly response: IHttpResponse;
}
