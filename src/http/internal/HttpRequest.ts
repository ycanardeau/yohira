import { IHttpContext } from '@/http.abstractions/IHttpContext';
import { IHttpRequest } from '@/http.abstractions/IHttpRequest';
import { PathString } from '@/http.abstractions/PathString';
import { HttpContext } from '@/http/HttpContext';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpRequest.cs,7c96c43ce8999806,references
export class HttpRequest implements IHttpRequest {
	constructor(readonly httpContext: IHttpContext) {}

	get method(): string {
		return (this.httpContext as HttpContext).nativeRequest.method ?? '';
	}

	get path(): PathString {
		return new PathString(
			(this.httpContext as HttpContext).nativeRequest.url,
		);
	}
}
