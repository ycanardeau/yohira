import {
	ClaimsIdentity,
	ClaimsPrincipal,
} from '@yohira/authentication.abstractions';
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
import {
	IHttpAuthenticationFeature,
	IServiceProvidersFeature,
} from '@yohira/http.features';

import { HttpAuthenticationFeature } from './features/authentication/HttpAuthenticationFeature';
import { HttpRequest } from './internal/HttpRequest';
import { HttpResponse } from './internal/HttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http/DefaultHttpContext.cs,6cd3f52cf0ced363,references
class FeatureInterfaces {
	serviceProviders: IServiceProvidersFeature | undefined;
	authentication: IHttpAuthenticationFeature | undefined;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/DefaultHttpContext.cs,804830786046817e,references
export class HttpContext implements IHttpContext {
	private static readonly newServiceProvidersFeature = (
		context: HttpContext,
	): IServiceProvidersFeature =>
		new RequestServicesFeature(context, context.serviceScopeFactory);
	private static readonly newHttpAuthenticationFeature =
		(): IHttpAuthenticationFeature => new HttpAuthenticationFeature();

	private _features = new FeatureReferences<FeatureInterfaces>(
		() => new FeatureInterfaces(),
	);

	readonly request: IHttpRequest;
	readonly response: IHttpResponse;

	constructor(features: IFeatureCollection) {
		this._features.initialize(features);
		this.request = new HttpRequest(this);
		this.response = new HttpResponse(this);
	}

	initialize(features: IFeatureCollection): void {
		const revision = features.revision;
		this._features.initialize(features, revision);
		// TODO: this.request.initialize(revision);
		// TODO: this.response.initialize(revision);
		// TODO
		// TODO: this.active = true;
	}

	serviceScopeFactory!: IServiceScopeFactory;

	private get serviceProvidersFeature(): IServiceProvidersFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._features.fetchWithState(
			IServiceProvidersFeature,
			{
				get: () => this._features.cache.serviceProviders,
				set: (value) => (this._features.cache.serviceProviders = value),
			},
			this,
			HttpContext.newServiceProvidersFeature,
		)!;
	}

	private get httpAuthenticationFeature(): IHttpAuthenticationFeature {
		return this._features.fetch(
			IHttpAuthenticationFeature,
			{
				get: () => this._features.cache.authentication,
				set: (value) => (this._features.cache.authentication = value),
			},
			HttpContext.newHttpAuthenticationFeature,
		)!;
	}

	get features(): IFeatureCollection {
		if (this._features === undefined) {
			throw new Error('Request has finished and IHttpContext disposed.');
		}

		return this._features.collection;
	}

	get user(): ClaimsPrincipal {
		let user = this.httpAuthenticationFeature.user;
		if (user === undefined) {
			user = ClaimsPrincipal.fromIdentity(
				new ClaimsIdentity(
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
				),
			);
			this.httpAuthenticationFeature.user = user;
		}
		return user;
	}
	set user(value: ClaimsPrincipal) {
		this.httpAuthenticationFeature.user = value;
	}

	get requestServices(): IServiceProvider {
		return this.serviceProvidersFeature.requestServices;
	}
	set requestServices(value: IServiceProvider) {
		this.serviceProvidersFeature.requestServices = value;
	}
}
