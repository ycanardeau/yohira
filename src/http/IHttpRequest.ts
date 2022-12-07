import { IHttpContext } from '@/http/IHttpContext';
import { PathString } from '@/http/PathString';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpRequest.cs,ea81be9b74317002,references
export interface IHttpRequest {
	readonly httpContext: IHttpContext;
	method: string;
	path: PathString;
}
