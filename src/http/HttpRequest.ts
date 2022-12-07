import { HttpContext } from '@/http/HttpContext';
import { IHttpContext } from '@/http/IHttpContext';
import { IHttpRequest } from '@/http/IHttpRequest';
import { PathString } from '@/http/PathString';

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
