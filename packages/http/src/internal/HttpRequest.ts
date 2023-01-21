import { Type } from '@yohira/base';
import { FeatureReferences } from '@yohira/extensions.features';
import {
	IHttpContext,
	IHttpRequest,
	PathString,
} from '@yohira/http.abstractions';
import { IHttpRequestFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpRequest.cs,00ce2db34b5033bf,references
class FeatureInterfaces {
	request?: IHttpRequestFeature;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultHttpRequest.cs,7c96c43ce8999806,references
export class HttpRequest implements IHttpRequest {
	private static readonly nullRequestFeature = ():
		| IHttpRequestFeature
		| undefined => {
		return undefined;
	};

	private features = new FeatureReferences<FeatureInterfaces>(
		FeatureInterfaces,
	);

	constructor(readonly httpContext: IHttpContext) {
		this.features.initialize(httpContext.features);
	}

	get httpRequestFeature(): IHttpRequestFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.features.fetch(
			Type.from('IHttpRequestFeature'),
			{
				get: () => {
					return this.features.cache.request;
				},
				set: (value) => {
					this.features.cache.request = value;
				},
			},
			this.features.collection,
			HttpRequest.nullRequestFeature,
		)!;
	}

	get method(): string {
		return this.httpRequestFeature.method;
	}

	get path(): PathString {
		return new PathString(this.httpRequestFeature.path);
	}
	set path(value: PathString) {
		this.httpRequestFeature.path = value.value ?? '';
	}
}
