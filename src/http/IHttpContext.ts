import { IHttpRequest } from '@/http/IHttpRequest';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpContext.cs,9bde6e3833d169c1,references
export interface IHttpContext {
	readonly request: IHttpRequest;
}
