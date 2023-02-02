import { IServiceProvider } from '@yohira/base';
import { IServiceScopeFactory } from '@yohira/extensions.dependency-injection.abstractions';
import {
	FeatureReferences,
	IFeatureCollection,
} from '@yohira/extensions.features';
import { RequestServicesFeature } from '@yohira/http';
import {
	IHttpContext,
	IHttpRequest,
	IHttpResponse,
} from '@yohira/http.abstractions';
import { IServiceProvidersFeature } from '@yohira/http.features';

import { HttpRequest } from './internal/HttpRequest';
import { HttpResponse } from './internal/HttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http/DefaultHttpContext.cs,6cd3f52cf0ced363,references
class FeatureInterfaces {
	serviceProviders?: IServiceProvidersFeature;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/DefaultHttpContext.cs,804830786046817e,references
export class HttpContext implements IHttpContext {
	private static readonly newServiceProvidersFeature = (
		context: HttpContext,
	): RequestServicesFeature =>
		new RequestServicesFeature(context, context.serviceScopeFactory);

	private _features = new FeatureReferences<FeatureInterfaces>(
		FeatureInterfaces,
	);

	readonly request: IHttpRequest;
	readonly response: IHttpResponse;

	constructor(features: IFeatureCollection) {
		this._features.initialize(features);
		this.request = new HttpRequest(this);
		this.response = new HttpResponse(this);
	}

	serviceScopeFactory!: IServiceScopeFactory;

	private get serviceProvidersFeature(): IServiceProvidersFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._features.fetch(
			Symbol.for('IServiceProvidersFeature'),
			{
				get: () => {
					return this._features.cache.serviceProviders;
				},
				set: (value) => {
					this._features.cache.serviceProviders = value;
				},
			},
			this,
			HttpContext.newServiceProvidersFeature,
		)!;
	}

	get features(): IFeatureCollection {
		if (this._features === undefined) {
			throw new Error('Request has finished and IHttpContext disposed.');
		}

		return this._features.collection;
	}

	get requestServices(): IServiceProvider {
		return this.serviceProvidersFeature.requestServices;
	}
	set requestServices(value: IServiceProvider) {
		this.serviceProvidersFeature.requestServices = value;
	}
}
