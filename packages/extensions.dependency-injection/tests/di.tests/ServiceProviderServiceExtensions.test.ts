import { IServiceProvider, usingAsync } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceScopeFactory,
	ServiceCollection,
	addScopedCtor,
	addSingletonInstance,
	addTransientCtor,
	createAsyncScopeFromProvider,
	createAsyncScopeFromServiceScopeFactory,
	getRequiredService,
	getServices,
} from '@yohira/extensions.dependency-injection.abstractions';
import { expect, test } from 'vitest';

const IFoo = Symbol.for('IFoo');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IFoo {}

class Foo1 implements IFoo {}

class Foo2 implements IFoo {}

const IBar = Symbol.for('IBar');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IBar {}

class Bar1 implements IBar {}

class Bar2 implements IBar {}

function createTestServiceProvider(count: number): IServiceProvider {
	const serviceCollection = new ServiceCollection();

	if (count > 0) {
		addTransientCtor(serviceCollection, IFoo, Foo1);
	}

	if (count > 1) {
		addTransientCtor(serviceCollection, IFoo, Foo2);
	}

	if (count > 2) {
		addTransientCtor(serviceCollection, IBar, Bar1);
	}

	if (count > 3) {
		addTransientCtor(serviceCollection, IBar, Bar2);
	}

	return buildServiceProvider(serviceCollection);
}

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L15
test('GetService_Returns_CorrectService', () => {
	const serviceProvider = createTestServiceProvider(1);

	const service = serviceProvider.getService<IFoo>(IFoo);

	expect(service).toBeInstanceOf(Foo1);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L41
test('GetRequiredService_Throws_WhenNoServiceRegistered', () => {
	const serviceProvider = createTestServiceProvider(0);

	expect(() => getRequiredService(serviceProvider, IFoo)).toThrowError(
		"No service for type 'IFoo' has been registered.",
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L83
test('GetServices_Returns_AllServices', () => {
	const serviceProvider = createTestServiceProvider(2);

	const services = getServices<IFoo>(serviceProvider, IFoo);

	expect(services.find((item) => item instanceof Foo1)).not.toBeUndefined();
	expect(services.find((item) => item instanceof Foo2)).not.toBeUndefined();
	expect(services.length).toBe(2);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L186
test('GetServices_WithBuildServiceProvider_Returns_EmptyList_WhenNoServicesAvailable', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonInstance(serviceCollection, Symbol.for('Iterable<IFoo>'), []);
	const serviceProvider = buildServiceProvider(serviceCollection);

	const services = getServices<IFoo>(serviceProvider, IFoo);

	expect(services.length).toBe(0);
	expect(services).toBeInstanceOf(Array);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L202
test('NonGeneric_GetServices_WithBuildServiceProvider_Returns_EmptyList_WhenNoServicesAvailable', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonInstance(serviceCollection, Symbol.for('Iterable<IFoo>'), []);
	const serviceProvider = buildServiceProvider(serviceCollection);

	const services = getServices<IFoo>(serviceProvider, IFoo);

	expect(services.length).toBe(0);
	expect(services).instanceof(Array);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L218
test('CreateAsyncScope_Returns_AsyncServiceScope_Wrapping_ServiceScope', async () => {
	const serviceCollection = new ServiceCollection();
	addScopedCtor(serviceCollection, IFoo, Foo1);
	const serviceProvider = buildServiceProvider(serviceCollection);

	await usingAsync(
		createAsyncScopeFromProvider(serviceProvider),
		async (scope) => {
			const service = scope.serviceProvider.getService<IFoo>(IFoo);

			expect(service).instanceof(Foo1);
		},
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L235
test('CreateAsyncScope_Returns_AsyncServiceScope_Wrapping_ServiceScope_For_IServiceScopeFactory', async () => {
	const serviceCollection = new ServiceCollection();
	addScopedCtor(serviceCollection, IFoo, Foo1);
	const serviceProvider = buildServiceProvider(serviceCollection);
	const factory =
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		serviceProvider.getService<IServiceScopeFactory>(IServiceScopeFactory)!;

	await usingAsync(
		createAsyncScopeFromServiceScopeFactory(factory),
		async (scope) => {
			const service = scope.serviceProvider.getService<IFoo>(IFoo);

			expect(service).toBeInstanceOf(Foo1);
		},
	);
});
