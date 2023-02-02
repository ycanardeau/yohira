import { FeatureReferences } from '@yohira/extensions.features';
import {
	IHttpContext,
	IHttpResponse,
	StatusCodes,
} from '@yohira/http.abstractions';
import { IHttpResponseBodyFeature } from '@yohira/http.features';
import { Stream } from 'node:stream';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpResponse.cs,b195f3cc5f74f4d2,references
class FeatureInterfaces {
	responseBody?: IHttpResponseBodyFeature;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpResponse.cs,d36a5786d91e7a26,references
export class HttpResponse implements IHttpResponse {
	private static readonly nullResponseBodyFeature = ():
		| IHttpResponseBodyFeature
		| undefined => {
		return undefined;
	};

	private readonly features = new FeatureReferences<FeatureInterfaces>(
		FeatureInterfaces,
	);

	constructor(readonly httpContext: IHttpContext) {
		this.features.initialize(httpContext.features);
	}

	private get httpResponseBodyFeature(): IHttpResponseBodyFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.features.fetch(
			Symbol.for('IHttpResponseBodyFeature'),
			{
				get: () => {
					return this.features.cache.responseBody;
				},
				set: (value) => {
					this.features.cache.responseBody = value;
				},
			},
			this.features.collection,
			HttpResponse.nullResponseBodyFeature,
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
}
