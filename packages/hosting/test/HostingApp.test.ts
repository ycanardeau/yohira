import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';
import { IFeatureCollection } from '@yohira/extensions.features';
import { addOptions } from '@yohira/extensions.options';
import {
	HostingApp,
	HostingAppContext,
	HttpContextFactory,
} from '@yohira/hosting';
import { Activity, HttpContext, IHttpActivityFeature } from '@yohira/http';
import { IHttpContextFactory } from '@yohira/http.abstractions';
import { expect, test } from 'vitest';

class FeaturesWithContext<T>
	implements /* TODO: IHostContextContainer<T>, */ IFeatureCollection
{
	hostContext!: T;

	constructor(readonly features: IFeatureCollection) {}

	get revision(): number {
		return this.features.revision;
	}

	get<T>(key: symbol): T | undefined {
		return this.features.get(key);
	}

	set<T>(key: symbol, instance: T | undefined): void {
		this.features.set(key, instance);
	}

	[Symbol.iterator](): Iterator<[symbol, any], any, undefined> {
		return this.features[Symbol.iterator]();
	}
}

function createApp(
	httpContextFactory?: IHttpContextFactory,
	useHttpContextAccessor = false,
	// TODO: activityScore?: ActivityScore,
	// TODO: meterFactory?: IMeterFactory,
): HostingApp {
	const services = new ServiceCollection();
	addOptions(services);
	if (useHttpContextAccessor) {
		// TODO: addHttpContextAccessor(services);
		throw new Error('Method not implemented.');
	}

	httpContextFactory ??= new HttpContextFactory(
		buildServiceProvider(services),
	);

	const hostingApp = new HostingApp(
		() => Promise.resolve(),
		// TODO
		httpContextFactory,
		// TODO
	);

	return hostingApp;
}

// https://github.com/dotnet/aspnetcore/blob/e0aed17a16f5f6e5540925ef849bf87358fa10b3/src/Hosting/Hosting/test/HostingApplicationTests.cs#L22C17-L22C85
test('DisposeContextDoesNotClearHttpContextIfDefaultHttpContextFactoryUsed', () => {
	const hostingApp = createApp();
	const httpContext = HttpContext.create();

	const context = hostingApp.createContext(httpContext.features);
	expect(context.httpContext).not.toBeUndefined();

	hostingApp.disposeContext(context, undefined);
	expect(context.httpContext).not.toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/e0aed17a16f5f6e5540925ef849bf87358fa10b3/src/Hosting/Hosting/test/HostingApplicationTests.cs#L37C17-L37C78
/* TODO: test('DisposeContextClearsHttpContextIfIHttpContextAccessorIsActive', () => {
	const hostingApp = createApp(undefined, true);
	const httpContext = HttpContext.create();

	const context = hostingApp.createContext(httpContext.features);
	expect(context.httpContext).not.toBeUndefined();

	hostingApp.disposeContext(context, undefined);
	expect(context.httpContext).toBeUndefined();
}); */

// https://github.com/dotnet/aspnetcore/blob/e0aed17a16f5f6e5540925ef849bf87358fa10b3/src/Hosting/Hosting/test/HostingApplicationTests.cs#L52C17-L52C77
test('CreateContextReinitializesPreviouslyStoredDefaultHttpContext', () => {
	const hostingApp = createApp();
	const features = new FeaturesWithContext<HostingAppContext>(
		HttpContext.create().features,
	);
	const previousContext = HttpContext.create();
	features.hostContext = new HostingAppContext();
	features.hostContext.httpContext = previousContext;

	const context = hostingApp.createContext(features);
	expect(context.httpContext === previousContext).toBe(true);

	hostingApp.disposeContext(context, undefined);
	expect(context.httpContext === previousContext).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e0aed17a16f5f6e5540925ef849bf87358fa10b3/src/Hosting/Hosting/test/HostingApplicationTests.cs#L71C17-L71C82
test('CreateContextCreatesNewContextIfNotUsingDefaultHttpContextFactory', () => {
	const factory: IHttpContextFactory = {
		create(f) {
			return new HttpContext(f);
		},
		dispose() {},
	};

	const hostingApp = createApp(factory);
	const features = new FeaturesWithContext<HostingAppContext>(
		HttpContext.create().features,
	);
	const previousContext = HttpContext.create();
	// Pretend like we had previous HttpContext
	features.hostContext = new HostingAppContext();
	features.hostContext.httpContext = previousContext;

	const context = hostingApp.createContext(features);
	expect(context.httpContext === previousContext).toBe(false);

	hostingApp.disposeContext(context, undefined);
});

// TODO

class TestHttpActivityFeature implements IHttpActivityFeature {
	activity!: Activity;
}

// https://github.com/dotnet/aspnetcore/blob/e0aed17a16f5f6e5540925ef849bf87358fa10b3/src/Hosting/Hosting/test/HostingApplicationTests.cs#L165C17-L165C67
test('IHttpActivityFeatureIsNotPopulatedWithoutAListener', () => {
	const hostingApp = createApp();
	const httpContext = HttpContext.create();
	httpContext.features.set<IHttpActivityFeature>(
		IHttpActivityFeature,
		new TestHttpActivityFeature(),
	);
	const context = hostingApp.createContext(httpContext.features);

	const activityFeature =
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		context.httpContext!.features.get<IHttpActivityFeature>(
			IHttpActivityFeature,
		);
	expect(activityFeature).not.toBeUndefined();
	if (activityFeature === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(activityFeature.activity).toBeUndefined();

	hostingApp.disposeContext(context, undefined);
});
