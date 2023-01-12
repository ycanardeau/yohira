import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { Type } from '@yohira/base/Type';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import {
	addSingletonInstance,
	addTransientCtor,
} from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import {
	getRequiredService,
	getServices,
} from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection/ServiceCollectionContainerBuilderExtensions';
import { expect, test } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IFoo {}

class Foo1 implements IFoo {}

class Foo2 implements IFoo {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IBar {}

class Bar1 implements IBar {}

class Bar2 implements IBar {}

function createTestServiceProvider(count: number): IServiceProvider {
	const serviceCollection = new ServiceCollection();

	if (count > 0) {
		addTransientCtor(serviceCollection, Type.from('IFoo'), Foo1);
	}

	if (count > 1) {
		addTransientCtor(serviceCollection, Type.from('IFoo'), Foo2);
	}

	if (count > 2) {
		addTransientCtor(serviceCollection, Type.from('IBar'), Bar1);
	}

	if (count > 3) {
		addTransientCtor(serviceCollection, Type.from('IBar'), Bar2);
	}

	return buildServiceProvider(serviceCollection);
}

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L15
test('GetService_Returns_CorrectService', () => {
	const serviceProvider = createTestServiceProvider(1);

	const service = serviceProvider.getService<IFoo>(Type.from('IFoo'));

	expect(service).toBeInstanceOf(Foo1);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L41
test('GetRequiredService_Throws_WhenNoServiceRegistered', () => {
	const serviceProvider = createTestServiceProvider(0);

	expect(() =>
		getRequiredService(serviceProvider, Type.from('IFoo')),
	).toThrowError("No service for type 'IFoo' has been registered.");
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L83
test('GetServices_Returns_AllServices', () => {
	const serviceProvider = createTestServiceProvider(2);

	const services = getServices<IFoo>(serviceProvider, Type.from('IFoo'));

	expect(services.find((item) => item instanceof Foo1)).not.toBeUndefined();
	expect(services.find((item) => item instanceof Foo2)).not.toBeUndefined();
	expect(services.length).toBe(2);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L186
test('GetServices_WithBuildServiceProvider_Returns_EmptyList_WhenNoServicesAvailable', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonInstance(serviceCollection, Type.from('Iterable<IFoo>'), []);
	const serviceProvider = buildServiceProvider(serviceCollection);

	const services = getServices<IFoo>(serviceProvider, Type.from('IFoo'));

	expect(services.length).toBe(0);
	expect(services).toBeInstanceOf(Array);
});

// TODO
