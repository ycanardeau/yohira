import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import { addTransientCtor } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
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

const createTestServiceProvider = (count: number): IServiceProvider => {
	const serviceCollection = new ServiceCollection();

	if (count > 0) {
		addTransientCtor(serviceCollection, 'IFoo', Foo1);
	}

	if (count > 1) {
		addTransientCtor(serviceCollection, 'IFoo', Foo2);
	}

	if (count > 2) {
		addTransientCtor(serviceCollection, 'IBar', Bar1);
	}

	if (count > 3) {
		addTransientCtor(serviceCollection, 'IBar', Bar2);
	}

	return buildServiceProvider(serviceCollection);
};

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L15
test('GetService_Returns_CorrectService', () => {
	const serviceProvider = createTestServiceProvider(1);

	const service = serviceProvider.getService<IFoo>('IFoo');

	expect(service).toBeInstanceOf(Foo1);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderServiceExtensionsTest.cs#L41
test('GetRequiredService_Throws_WhenNoServiceRegistered', () => {
	const serviceProvider = createTestServiceProvider(0);

	expect(() => getRequiredService(serviceProvider, 'IFoo')).toThrowError(
		"No service for type 'IFoo' has been registered.",
	);
});

// TODO
