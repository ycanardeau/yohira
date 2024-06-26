import { ClaimsIdentity, ClaimsPrincipal } from '@yohira/base';
import { IServiceProvider } from '@yohira/base';
import { IServiceScopeFactory } from '@yohira/extensions.dependency-injection.abstractions';
import {
	FeatureCollection,
	FeatureReferences,
	IFeatureCollection,
} from '@yohira/extensions.features';
import { IConnectionInfo, IHttpContext } from '@yohira/http.abstractions';
import {
	IHttpAuthenticationFeature,
	IHttpRequestFeature,
	IHttpRequestIdentifierFeature,
	IHttpResponseFeature,
	IItemsFeature,
	IServiceProvidersFeature,
} from '@yohira/http.features';

import { ConnectionInfo } from './ConnectionInfo';
import { HttpRequestFeature } from './features/HttpRequestFeature';
import { HttpRequestIdentifierFeature } from './features/HttpRequestIdentifierFeature';
import { HttpResponseFeature } from './features/HttpResponseFeature';
import { ItemsFeature } from './features/ItemsFeature';
import { RequestServicesFeature } from './features/RequestServicesFeature';
import { HttpAuthenticationFeature } from './features/authentication/HttpAuthenticationFeature';
import { HttpRequest } from './internal/HttpRequest';
import { HttpResponse } from './internal/HttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http/DefaultHttpContext.cs,6cd3f52cf0ced363,references
class FeatureInterfaces {
	items: IItemsFeature | undefined;
	serviceProviders: IServiceProvidersFeature | undefined;
	authentication: IHttpAuthenticationFeature | undefined;
	requestIdentifier: IHttpRequestIdentifierFeature | undefined;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/DefaultHttpContext.cs,804830786046817e,references
export class HttpContext implements IHttpContext {
	private static readonly newItemsFeature = (): IItemsFeature =>
		new ItemsFeature();
	private static readonly newServiceProvidersFeature = (
		context: HttpContext,
	): IServiceProvidersFeature =>
		new RequestServicesFeature(context, context.serviceScopeFactory);
	private static readonly newHttpAuthenticationFeature =
		(): IHttpAuthenticationFeature => new HttpAuthenticationFeature();
	private static readonly newHttpRequestIdentifierFeature =
		(): IHttpRequestIdentifierFeature => new HttpRequestIdentifierFeature();

	private _features = new FeatureReferences<FeatureInterfaces>(
		() => new FeatureInterfaces(),
	);

	readonly request: HttpRequest;
	readonly response: HttpResponse;

	private _connection: ConnectionInfo | undefined;

	// This is field exists to make analyzing memory dumps easier.
	// https://github.com/dotnet/aspnetcore/issues/29709
	/** @internal */ active = false;

	constructor(features: IFeatureCollection) {
		this._features.initialize(features);
		this.request = new HttpRequest(this);
		this.response = new HttpResponse(this);
	}

	static createWithDefaultFeatureCollection(): HttpContext {
		const httpContext = new HttpContext(new FeatureCollection());
		httpContext.features.set<IHttpRequestFeature>(
			IHttpRequestFeature,
			new HttpRequestFeature(),
		);
		httpContext.features.set<IHttpResponseFeature>(
			IHttpResponseFeature,
			new HttpResponseFeature(),
		);
		/* TODO: httpContext.features.set<IHttpResponseBodyFeature>(
			IHttpResponseBodyFeature,
			new StreamResponseBodyFeature(Stream.undefined),
		); */
		return httpContext;
	}

	get connection(): IConnectionInfo {
		return (
			this._connection ??
			(this._connection = new ConnectionInfo(this.features))
		);
	}

	initialize(features: IFeatureCollection): void {
		const revision = features.revision;
		this._features.initialize(features, revision);
		this.request.initialize(revision);
		this.response.initialize(revision);
		this._connection?.initialize(features, revision);
		// TODO: this.websockets?.initialize(features, revision);
		this.active = true;
	}

	/**
	 * Uninitialize all the features in the {@link HttpContext}.
	 */
	uninitialize(): void {
		this._features = new FeatureReferences<FeatureInterfaces>(
			() => new FeatureInterfaces(),
		);
		this.request.uninitialize();
		this.response.uninitialize();
		this._connection?.uninitialize();
		// TODO: this.websockets?.uninitialize();
		this.active = false;
	}

	serviceScopeFactory!: IServiceScopeFactory;

	private get itemsFeature(): IItemsFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._features.fetch(
			IItemsFeature,
			{
				get: () => this._features.cache.items,
				set: (value) => (this._features.cache.items = value),
			},
			HttpContext.newItemsFeature,
		)!;
	}

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
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._features.fetch(
			IHttpAuthenticationFeature,
			{
				get: () => this._features.cache.authentication,
				set: (value) => (this._features.cache.authentication = value),
			},
			HttpContext.newHttpAuthenticationFeature,
		)!;
	}

	private get requestIdentifierFeature(): IHttpRequestIdentifierFeature {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._features.fetch(
			IHttpRequestIdentifierFeature,
			{
				get: () => this._features.cache.requestIdentifier,
				set: (value) =>
					(this._features.cache.requestIdentifier = value),
			},
			HttpContext.newHttpRequestIdentifierFeature,
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

	get items(): Map<unknown /* TODO */, unknown /* TODO */ | undefined> {
		return this.itemsFeature.items;
	}
	set items(value: Map<unknown /* TODO */, unknown /* TODO */ | undefined>) {
		this.itemsFeature.items = value;
	}

	get requestServices(): IServiceProvider {
		return this.serviceProvidersFeature.requestServices;
	}
	set requestServices(value: IServiceProvider) {
		this.serviceProvidersFeature.requestServices = value;
	}

	get traceIdentifier(): string {
		return this.requestIdentifierFeature.traceIdentifier;
	}
	set traceIdentifier(value: string) {
		this.requestIdentifierFeature.traceIdentifier = value;
	}
}
