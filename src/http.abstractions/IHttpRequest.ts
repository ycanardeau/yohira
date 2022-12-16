import { IHttpContext } from '@/http.abstractions/IHttpContext';
import { PathString } from '@/http.abstractions/PathString';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpRequest.cs,ea81be9b74317002,references
export interface IHttpRequest {
	readonly httpContext: IHttpContext;
	method: string;
	path: PathString;
}
