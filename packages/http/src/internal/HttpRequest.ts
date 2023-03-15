import {
	FeatureReferences,
	IFeatureCollection,
} from '@yohira/extensions.features';
import {
	IHttpContext,
	IHttpRequest,
	PathString,
} from '@yohira/http.abstractions';
import {
	IHttpRequestFeature,
	IRequestCookieCollection,
	IRequestCookiesFeature,
} from '@yohira/http.features';
import { IncomingHttpHeaders } from 'node:http';

import { RequestCookiesFeature } from '../features/RequestCookiesFeature';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpRequest.cs,00ce2db34b5033bf,references
class FeatureInterfaces {
	request?: IHttpRequestFeature;
	cookies?: IRequestCookiesFeature;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpRequest.cs,7c96c43ce8999806,references
export class HttpRequest implements IHttpRequest {
	private static readonly nullRequestFeature = ():
		| IHttpRequestFeature
		| undefined => {
		return undefined;
	};
	private static readonly newRequestCookiesFeature = (
		f: IFeatureCollection,
	): IRequestCookiesFeature => new RequestCookiesFeature(f);

	private features = new FeatureReferences<FeatureInterfaces>(
		() => new FeatureInterfaces(),
	);

	constructor(readonly httpContext: IHttpContext) {
		this.features.initialize(httpContext.features);
	}

	private get httpRequestFeature(): IHttpRequestFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.features.fetch(
			IHttpRequestFeature,
			{
				get: () => this.features.cache.request,
				set: (value) => (this.features.cache.request = value),
			},
			this.features.collection,
			HttpRequest.nullRequestFeature,
		)!;
	}

	private get requestCookiesFeature(): IRequestCookiesFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.features.fetch(
			IRequestCookiesFeature,
			{
				get: () => this.features.cache.cookies,
				set: (value) => (this.features.cache.cookies = value),
			},
			this.features.collection,
			HttpRequest.newRequestCookiesFeature,
		)!;
	}

	get rawBody(): string {
		return this.httpRequestFeature.rawBody;
	}

	get method(): string {
		return this.httpRequestFeature.method;
	}
	set method(value: string) {
		this.httpRequestFeature.method = value;
	}

	get path(): PathString {
		return new PathString(this.httpRequestFeature.path);
	}
	set path(value: PathString) {
		this.httpRequestFeature.path = value.value ?? '';
	}

	get queryString(): string {
		return this.httpRequestFeature.queryString;
	}

	get headers(): IncomingHttpHeaders {
		return this.httpRequestFeature.headers;
	}

	get cookies(): IRequestCookieCollection {
		return this.requestCookiesFeature.cookies;
	}
	set cookies(value: IRequestCookieCollection) {
		this.requestCookiesFeature.cookies = value;
	}
}
