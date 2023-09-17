import {
	FeatureReferences,
	IFeatureCollection,
} from '@yohira/extensions.features';
import { ResponseCookiesFeature } from '@yohira/http';
import {
	IHttpContext,
	IHttpResponse,
	StatusCodes,
} from '@yohira/http.abstractions';
import {
	IHttpResponseBodyFeature,
	IHttpResponseFeature,
	IResponseCookies,
	IResponseCookiesFeature,
	IResponseHeaderDictionary,
} from '@yohira/http.features';
import { Stream } from 'node:stream';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpResponse.cs,b195f3cc5f74f4d2,references
class FeatureInterfaces {
	response: IHttpResponseFeature | undefined;
	responseBody: IHttpResponseBodyFeature | undefined;
	cookies: IResponseCookiesFeature | undefined;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpResponse.cs,d36a5786d91e7a26,references
export class HttpResponse implements IHttpResponse {
	private static readonly nullResponseFeature = ():
		| IHttpResponseFeature
		| undefined => undefined;
	private static readonly nullResponseBodyFeature = ():
		| IHttpResponseBodyFeature
		| undefined => undefined;
	private static readonly newResponseCookiesFeature = (
		f: IFeatureCollection,
	): IResponseCookiesFeature | undefined => new ResponseCookiesFeature(f);

	private readonly features = new FeatureReferences<FeatureInterfaces>(
		() => new FeatureInterfaces(),
	);

	constructor(readonly httpContext: IHttpContext) {
		this.features.initialize(httpContext.features);
	}

	private get httpResponseFeature(): IHttpResponseFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.features.fetch(
			IHttpResponseFeature,
			{
				get: () => this.features.cache.response,
				set: (value) => (this.features.cache.response = value),
			},
			this.features.collection,
			HttpResponse.nullResponseFeature,
		)!;
	}

	private get httpResponseBodyFeature(): IHttpResponseBodyFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.features.fetch(
			IHttpResponseBodyFeature,
			{
				get: () => this.features.cache.responseBody,
				set: (value) => (this.features.cache.responseBody = value),
			},
			this.features.collection,
			HttpResponse.nullResponseBodyFeature,
		)!;
	}

	private get responseCookiesFeature(): IResponseCookiesFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.features.fetch(
			IResponseCookiesFeature,
			{
				get: () => this.features.cache.cookies,
				set: (value) => (this.features.cache.cookies = value),
			},
			this.features.collection,
			HttpResponse.newResponseCookiesFeature,
		)!;
	}

	// TODO
	private _statusCode = StatusCodes.Status200OK;
	get statusCode(): StatusCodes {
		return this._statusCode;
	}
	set statusCode(value: StatusCodes) {
		this._statusCode = value;
	}

	get headers(): IResponseHeaderDictionary {
		return this.httpResponseFeature.responseHeaders;
	}

	get body(): Stream {
		return this.httpResponseBodyFeature.stream;
	}

	// TODO
	private _contentType?: string;
	get contentType(): string | undefined {
		return this._contentType;
	}
	set contentType(value: string | undefined) {
		this._contentType = value;
	}

	get cookies(): IResponseCookies {
		return this.responseCookiesFeature.cookies;
	}

	get hasStarted(): boolean {
		// TODO: return this.httpResponseFeature.hasStarted;
		throw new Error('Method not implemented.');
	}

	onStarting(
		callback: (state: object) => Promise<void>,
		state: object,
	): void {
		this.httpResponseFeature.onStarting(callback, state);
	}
}
