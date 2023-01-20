import {
	IHttpContext,
	IHttpRequest,
	PathString,
} from '@yohira/http.abstractions';
import { IHttpRequestFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpRequest.cs,7c96c43ce8999806,references
export class HttpRequest implements IHttpRequest {
	constructor(readonly httpContext: IHttpContext) {}

	get httpRequestFeature(): IHttpRequestFeature {
		// TODO
		throw new Error('Method not implemented.');
	}

	get method(): string {
		return this.httpRequestFeature.method;
	}

	get path(): PathString {
		return new PathString(this.httpRequestFeature.path);
	}
}
