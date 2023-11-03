import {
	ClaimsIdentity,
	ClaimsPrincipal,
} from '@yohira/authentication.abstractions';
import { IAsyncDisposable, IDisposable, IServiceProvider } from '@yohira/base';
import {
	ServiceProvider,
	buildServiceProvider,
} from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	IServiceScope,
	IServiceScopeFactory,
	ServiceCollection,
	addTransientCtor,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	FeatureCollection,
	IFeatureCollection,
} from '@yohira/extensions.features';
import {
	HttpContext,
	HttpRequestFeature,
	HttpResponseFeature,
} from '@yohira/http';
import {
	IHttpRequestFeature,
	IHttpResponseFeature,
	IItemsFeature,
	IResponseHeaderDictionary,
} from '@yohira/http.features';
import { expect, test } from 'vitest';

// TODO

// https://github.com/dotnet/aspnetcore/blob/95b1de9ccf67adbc57919132464dac44c20e92b8/src/Http/Http/test/DefaultHttpContextTests.cs#L80C17-L80C37
test('EmptyUserIsNeverNull', () => {
	const context = new HttpContext(new FeatureCollection());
	expect(context.user).not.toBeUndefined();
	expect(context.user.identities.length).toBe(1);
	expect(context.user === context.user).toBe(true);
	expect(context.user.identity?.isAuthenticated).toBe(false);
	expect(!context.user.identity?.authenticationType).toBe(true);

	context.user = undefined!;
	expect(context.user).not.toBeUndefined();
	expect(context.user.identities.length).toBe(1);
	expect(context.user === context.user).toBe(true);
	expect(context.user.identity?.isAuthenticated).toBe(false);
	expect(!context.user.identity?.authenticationType).toBe(true);

	context.user = new ClaimsPrincipal();
	expect(context.user).not.toBeUndefined();
	expect(context.user.identities.length).toBe(0);
	expect(context.user === context.user).toBe(true);
	expect(context.user.identity).toBeUndefined();

	context.user = ClaimsPrincipal.fromIdentity(
		new ClaimsIdentity(
			undefined,
			undefined,
			'SomeAuthType',
			undefined,
			undefined,
		),
	);
	expect(context.user.identity?.authenticationType).toBe('SomeAuthType');
	expect(context.user.identity?.isAuthenticated).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/95b1de9ccf67adbc57919132464dac44c20e92b8/src/Http/Http/test/DefaultHttpContextTests.cs#L108C17-L108C51
test('GetItems_DefaultCollectionProvided', () => {
	const context = new HttpContext(new FeatureCollection());
	expect(context.features.get<IItemsFeature>(IItemsFeature)).toBeUndefined();
	const items = context.items;
	expect(
		context.features.get<IItemsFeature>(IItemsFeature),
	).not.toBeUndefined();
	expect(items).not.toBeUndefined();
	expect(context.items === items).toBe(true);
	const item = {};
	context.items.set('foo', item);
	expect(context.items.get('foo') === item).toBe(true);
});

// TODO

// https://github.com/dotnet/aspnetcore/blob/95b1de9ccf67adbc57919132464dac44c20e92b8/src/Http/Http/test/DefaultHttpContextTests.cs#L136C17-L136C43
test('SetItems_NewCollectionUsed', () => {
	const context = new HttpContext(new FeatureCollection());
	expect(context.features.get<IItemsFeature>(IItemsFeature)).toBeUndefined();
	const items = new Map<unknown /* TODO */, unknown /* TODO */>();
	context.items = items;
	expect(
		context.features.get<IItemsFeature>(IItemsFeature),
	).not.toBeUndefined();
	expect(context.items === items).toBe(true);
	const item = {};
	items.set('foo', item);
	expect(context.items.get('foo') === item).toBe(true);
});

function testCachedFeaturesAreUndefined(
	value: unknown /* TODO */,
	features: IFeatureCollection | undefined,
): void {
	// TODO
	// TODO: throw new Error('Method not implemented.');
}

function testAllCachedFeaturesAreUndefined(
	context: HttpContext,
	features: IFeatureCollection,
): void {
	testCachedFeaturesAreUndefined(context, features);
	testCachedFeaturesAreUndefined(context.request, features);
	testCachedFeaturesAreUndefined(context.response, features);
	// TODO: testCachedFeaturesAreUndefined(context.connection, features);
	// TODO: testCachedFeaturesAreUndefined(context.webSockets, features);
}

function testCachedFeaturesAreSet(
	value: unknown /* TODO */,
	features: IFeatureCollection,
): void {
	// TODO
	// TODO: throw new Error('Method not implemented.');
}

function testAllCachedFeaturesAreSet(
	context: HttpContext,
	features: IFeatureCollection,
): void {
	testCachedFeaturesAreSet(context, features);
	testCachedFeaturesAreSet(context.request, features);
	testCachedFeaturesAreSet(context.response, features);
	// TODO: testCachedFeaturesAreSet(context.connection, features);
	// TODO: testCachedFeaturesAreSet(context.webSockets, features);
}

// https://github.com/dotnet/aspnetcore/blob/95b1de9ccf67adbc57919132464dac44c20e92b8/src/Http/Http/test/DefaultHttpContextTests.cs#L150C17-L150C52
test('UpdateFeatures_ClearsCachedFeatures', () => {
	const features = new FeatureCollection();
	features.set(IHttpRequestFeature, new HttpRequestFeature());
	features.set(IHttpResponseFeature, new HttpResponseFeature());
	/* TODO: features.set(
		IHttpResponseBodyFeature,
		new StreamResponseBodyFeature(Stream.undefined),
	); */
	// TODO: features.set(IHttpWebSocketFeature, new TestHttpWebSocketFeature());

	// FeatureCollection is set. all cached interfaces are undefined.
	const context = new HttpContext(features);
	testAllCachedFeaturesAreUndefined(context, features);
	expect(Array.from(features).length).toBe(2 /* TODO: 4 */);

	// getting feature properties populates feature collection with defaults
	testAllCachedFeaturesAreSet(context, features);
	expect(Array.from(features).length).toBe(2 /* TODO: 4 */);

	// FeatureCollection is null. and all cached interfaces are null.
	// only top level is tested because child objects are inaccessible.
	context.uninitialize();
	testCachedFeaturesAreUndefined(context, undefined);

	const newFeatures = new FeatureCollection();
	newFeatures.set(IHttpRequestFeature, new HttpRequestFeature());
	newFeatures.set(IHttpResponseFeature, new HttpResponseFeature());
	/* TODO: newFeatures.set(
		IHttpResponseBodyFeature,
		new StreamResponseBodyFeature(Stream.undefined),
	); */
	// TODO: newFeatures.set(IHttpWebSocketFeature, new TestHttpWebSocketFeature());

	// FeatureCollection is set to newFeatures. all cached interfaces are undefined.
	context.initialize(newFeatures);
	testAllCachedFeaturesAreUndefined(context, newFeatures);
	expect(Array.from(newFeatures).length).toBe(2 /* TODO: 4 */);

	// getting feature properties populates new feature collection with defaults
	testAllCachedFeaturesAreSet(context, newFeatures);
	expect(Array.from(newFeatures).length).toBe(2 /* TODO: 4 */);
});

// https://github.com/dotnet/aspnetcore/blob/95b1de9ccf67adbc57919132464dac44c20e92b8/src/Http/Http/test/DefaultHttpContextTests.cs#L189C17-L189C61
test('RequestServicesAreNotOverwrittenIfAlreadySet', () => {
	const serviceProvider = buildServiceProvider(new ServiceCollection());

	const scopeFactory = getRequiredService<IServiceScopeFactory>(
		serviceProvider,
		IServiceScopeFactory,
	);

	const context = HttpContext.create();
	context.serviceScopeFactory = scopeFactory;
	context.requestServices = serviceProvider;

	expect(context.requestServices === serviceProvider).toBe(true);
});

class DisposableThing implements IDisposable {
	disposed = false;

	[Symbol.dispose](): void {
		this.disposed = true;
	}
}

class TestHttpResponseFeature implements IHttpResponseFeature {
	completedCallbacks: {
		callback: (state: object) => Promise<void>;
		state: object;
	}[] = [];

	responseHeaders: IResponseHeaderDictionary =
		{} as IResponseHeaderDictionary /* TODO */;

	onCompleted(
		callback: (state: object) => Promise<void>,
		state: object,
	): void {
		this.completedCallbacks.push({ callback, state });
	}

	onStarting(
		callback: (state: object) => Promise<void>,
		state: object,
	): void {}
}

// https://github.com/dotnet/aspnetcore/blob/95b1de9ccf67adbc57919132464dac44c20e92b8/src/Http/Http/test/DefaultHttpContextTests.cs#L204C23-L204C60
/* TODO: test('RequestServicesAreDisposedOnCompleted', async () => {
	let $: IServiceCollection = new ServiceCollection();
	$ = addTransientCtor($, Symbol.for('DisposableThing'), DisposableThing);
	const serviceProvider = buildServiceProvider($);

	const scopeFactory = getRequiredService<IServiceScopeFactory>(
		serviceProvider,
		IServiceScopeFactory,
	);
	let instance: DisposableThing | undefined = undefined;

	const context = HttpContext.create();
	context.serviceScopeFactory = scopeFactory;
	const responseFeature = new TestHttpResponseFeature();
	context.features.set<IHttpResponseFeature>(
		IHttpResponseFeature,
		responseFeature,
	);

	expect(context.requestServices).not.toBeUndefined();
	expect(responseFeature.completedCallbacks.length).toBe(1);

	instance = getRequiredService<DisposableThing>(
		context.requestServices,
		Symbol.for('DisposableThing'),
	);

	const callback = responseFeature.completedCallbacks[0];
	await callback.callback(callback.state);

	expect(context.requestServices).toBeUndefined();
	expect(instance.disposed).toBe(true);
}); */

class AsyncServiceScope implements IServiceScope, IAsyncDisposable {
	disposeCalled = false;
	disposeAsyncCalled = false;

	constructor(private readonly scope: IServiceScope) {}

	[Symbol.dispose](): void {
		this.disposeCalled = true;
		this.scope[Symbol.dispose]();
	}

	[Symbol.asyncDispose](): Promise<void> {
		this.disposeAsyncCalled = true;
		this.scope[Symbol.dispose]();
		return Promise.resolve();
	}

	get serviceProvider(): IServiceProvider {
		return this.scope.serviceProvider;
	}
}

class AsyncDisposableServiceProvider
	implements IServiceProvider, IDisposable, IServiceScopeFactory
{
	readonly scopes: AsyncServiceScope[] = [];

	constructor(private readonly serviceProvider: ServiceProvider) {}

	getService<T>(serviceType: symbol): T | undefined {
		if (serviceType === IServiceScopeFactory) {
			return this as unknown as T /* REVIEW */;
		}

		return this.serviceProvider.getService(serviceType);
	}

	[Symbol.dispose](): void {
		this.serviceProvider[Symbol.dispose]();
	}

	createScope(): IServiceScope {
		const scope = new AsyncServiceScope(
			this.serviceProvider
				.getService<IServiceScopeFactory>(IServiceScopeFactory)!
				.createScope(),
		);
		this.scopes.push(scope);
		return scope;
	}
}

// https://github.com/dotnet/aspnetcore/blob/95b1de9ccf67adbc57919132464dac44c20e92b8/src/Http/Http/test/DefaultHttpContextTests.cs#L231C23-L231C64
/* TODO: test('RequestServicesAreDisposedAsyncOnCompleted', async () => {
	let $: IServiceCollection = new ServiceCollection();
	$ = addTransientCtor($, Symbol.for('DisposableThing'), DisposableThing);
	const serviceProvider = new AsyncDisposableServiceProvider(
		buildServiceProvider($),
	);

	const scopeFactory = getRequiredService<IServiceScopeFactory>(
		serviceProvider,
		IServiceScopeFactory,
	);
	let instance: DisposableThing | undefined = undefined;

	const context = HttpContext.create();
	context.serviceScopeFactory = scopeFactory;
	const responseFeature = new TestHttpResponseFeature();
	context.features.set<IHttpResponseFeature>(
		IHttpResponseFeature,
		responseFeature,
	);

	expect(context.requestServices).not.toBeUndefined();
	expect(responseFeature.completedCallbacks.length).toBe(1);

	instance = getRequiredService<DisposableThing>(
		context.requestServices,
		Symbol.for('DisposableThing'),
	);

	const callback = responseFeature.completedCallbacks[0];
	await callback.callback(callback.state);

	expect(context.requestServices).toBeUndefined();
	expect(instance.disposed).toBe(true);
	expect(serviceProvider.scopes.length).toBe(1);
	const scope = serviceProvider.scopes[0];
	expect(scope.disposeAsyncCalled).toBe(true);
	expect(scope.disposeCalled).toBe(false);
}); */

// https://github.com/dotnet/aspnetcore/blob/95b1de9ccf67adbc57919132464dac44c20e92b8/src/Http/Http/test/DefaultHttpContextTests.cs#L261C17-L261C48
test('InternalActiveFlagIsSetAndUnset', () => {
	const context = HttpContext.create();

	expect(context.active).toBe(false);

	context.initialize(new FeatureCollection());

	expect(context.active).toBe(true);

	context.uninitialize();

	expect(context.active).toBe(false);
});

// TODO
