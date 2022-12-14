import { HttpContext } from './HttpContext';
import { IHttpContext } from './IHttpContext';
import { IHttpRequest } from './IHttpRequest';
import { PathString } from './PathString';

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
