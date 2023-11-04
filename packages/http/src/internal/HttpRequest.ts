import {
	FeatureReferences,
	IFeatureCollection,
} from '@yohira/extensions.features';
import {
	HostString,
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
	request: IHttpRequestFeature | undefined;
	cookies: IRequestCookiesFeature | undefined;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpRequest.cs,7c96c43ce8999806,references
export class HttpRequest implements IHttpRequest {
	private static readonly http = 'http';
	private static readonly https = 'https';

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

	initialize(revision?: number): void {
		this.features.initialize(this.httpContext.features, revision);
	}

	uninitialize(): void {
		this.features = new FeatureReferences<FeatureInterfaces>(
			() => new FeatureInterfaces(),
		);
	}

	private get httpRequestFeature(): IHttpRequestFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.features.fetch(
			IHttpRequestFeature,
			{
				get: () => this.features.cache.request,
				set: (value) => (this.features.cache.request = value),
			},
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

	get scheme(): string {
		return this.httpRequestFeature.scheme;
	}
	set scheme(value: string) {
		this.httpRequestFeature.scheme = value;
	}

	get isHttps(): boolean {
		return HttpRequest.https === this.scheme.toLowerCase();
	}
	set isHttps(value: boolean) {
		this.scheme = value ? HttpRequest.https : HttpRequest.http;
	}

	get host(): HostString {
		return HostString.fromUriComponent(this.headers.host ?? '');
	}
	set host(value: HostString) {
		this.headers.host = value.toUriComponent();
	}

	get pathBase(): PathString {
		return new PathString(this.httpRequestFeature.pathBase);
	}
	set pathBase(value: PathString) {
		this.httpRequestFeature.pathBase = value.value ?? '';
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
		return this.httpRequestFeature.requestHeaders;
	}

	get cookies(): IRequestCookieCollection {
		return this.requestCookiesFeature.cookies;
	}
	set cookies(value: IRequestCookieCollection) {
		this.requestCookiesFeature.cookies = value;
	}
}
