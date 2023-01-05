import { Type } from '@yohira/base/Type';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import {
	addScopedCtor,
	addSingletonCtor,
	addTransientCtor,
} from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection/ServiceCollectionContainerBuilderExtensions';
import { ServiceProviderOptions } from '@yohira/extensions.dependency-injection/ServiceProviderOptions';
import { inject } from 'inversify';
import { expect, test } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IBar {}

class Bar implements IBar {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IFoo {}

class Foo implements IFoo {
	constructor(@inject('IBar') readonly bar: IBar) {}
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IBaz {}

class Baz implements IBaz {}

class Bar2 implements IBar {
	constructor(@inject('IBaz') readonly baz: IBaz) {}
}

/* TODO: class BazRecursive implements IBaz {
	constructor(@inject('IBaz') readonly baz: IBaz) {}
}*/

/* TODO: class Boo implements IBoo {
	constructor(
		@inject('IServiceScopeFactory')
		readonly scopeFactory: IServiceScopeFactory,
	) {}
}*/

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L13
test('GetService_Throws_WhenScopedIsInjectedIntoSingleton', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonCtor(serviceCollection, Type.from('IFoo'), Foo);
	addScopedCtor(serviceCollection, Type.from('IBar'), Bar);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() =>
		serviceProvider.getService<IFoo>(Type.from('IFoo')),
	).toThrowError(
		"Cannot consume scoped service 'IBar' from singleton 'IFoo'." /* TODO */,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L27
test('GetService_Throws_WhenScopedIsInjectedIntoSingletonThroughTransient', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonCtor(serviceCollection, Type.from('IFoo'), Foo);
	addTransientCtor(serviceCollection, Type.from('IBar'), Bar2);
	addScopedCtor(serviceCollection, Type.from('IBaz'), Baz);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() =>
		serviceProvider.getService<IFoo>(Type.from('IFoo')),
	).toThrowError(
		"Cannot consume scoped service 'IBaz' from singleton 'IFoo'." /* TODO */,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L42
test('GetService_Throws_WhenScopedIsInjectedIntoSingletonThroughSingleton', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonCtor(serviceCollection, Type.from('IFoo'), Foo);
	addSingletonCtor(serviceCollection, Type.from('IBar'), Bar2);
	addScopedCtor(serviceCollection, Type.from('IBaz'), Baz);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() =>
		serviceProvider.getService<IFoo>(Type.from('IFoo')),
	).toThrowError(
		"Cannot consume scoped service 'IBaz' from singleton 'IBar'." /* TODO */,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L57
// TODO: test('GetService_Throws_WhenScopedIsInjectedIntoSingletonThroughSingletonAndScopedWhileInScope', () => {});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L74
test('GetService_Throws_WhenGetServiceForScopedServiceIsCalledOnRoot', () => {
	const serviceCollection = new ServiceCollection();
	addScopedCtor(serviceCollection, Type.from('IBar'), Bar);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() =>
		serviceProvider.getService<IBar>(Type.from('IBar')),
	).toThrowError(
		"Cannot resolve scoped service 'IBar' from root provider." /* TODO */,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L87
test('GetService_Throws_WhenGetServiceForScopedServiceIsCalledOnRootViaTransient', () => {
	const serviceCollection = new ServiceCollection();
	addTransientCtor(serviceCollection, Type.from('IFoo'), Foo);
	addScopedCtor(serviceCollection, Type.from('IBar'), Bar);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() =>
		serviceProvider.getService<IFoo>(Type.from('IFoo')),
	).toThrowError(
		`Cannot resolve 'IFoo' from root provider because it requires scoped service 'IBar'.`,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L101
/* TODO: test('GetService_DoesNotThrow_WhenScopeFactoryIsInjectedIntoSingleton', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonCtor(serviceCollection, 'IBoo', Boo);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() => serviceProvider.getService<IBoo>('IBoo')).not.toBeUndefined();
});*/

// TODO
