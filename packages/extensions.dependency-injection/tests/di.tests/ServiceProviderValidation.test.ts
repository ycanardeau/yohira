import { keyForType } from '@yohira/base';
import {
	ServiceProviderOptions,
	buildServiceProvider,
} from '@yohira/extensions.dependency-injection';
import {
	IServiceScopeFactory,
	ServiceCollection,
	addScopedCtor,
	addSingletonCtor,
	addTransientCtor,
	inject,
} from '@yohira/extensions.dependency-injection.abstractions';
import { expect, test } from 'vitest';

const IBar = Symbol.for('IBar');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IBar {}

class Bar implements IBar {}

const IFoo = Symbol.for('IFoo');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IFoo {}

class Foo implements IFoo {
	constructor(@inject(IBar) readonly bar: IBar) {}
}

const IBaz = Symbol.for('IBaz');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IBaz {}

class Baz implements IBaz {}

class Bar2 implements IBar {
	constructor(@inject(IBaz) readonly baz: IBaz) {}
}

class BazRecursive implements IBaz {
	constructor(@inject(IBaz) readonly baz: IBaz) {}
}

const IBoo = Symbol.for('IBoo');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IBoo {}

class Boo implements IBoo {
	constructor(
		@inject(IServiceScopeFactory)
		readonly scopeFactory: IServiceScopeFactory,
	) {}
}

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L13
test('GetService_Throws_WhenScopedIsInjectedIntoSingleton', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonCtor(serviceCollection, IFoo, Foo);
	addScopedCtor(serviceCollection, IBar, Bar);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() => serviceProvider.getService<IFoo>(IFoo)).toThrowError(
		"Cannot consume scoped service 'IBar' from singleton 'IFoo'." /* TODO */,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L27
test('GetService_Throws_WhenScopedIsInjectedIntoSingletonThroughTransient', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonCtor(serviceCollection, IFoo, Foo);
	addTransientCtor(serviceCollection, IBar, Bar2);
	addScopedCtor(serviceCollection, IBaz, Baz);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() => serviceProvider.getService<IFoo>(IFoo)).toThrowError(
		"Cannot consume scoped service 'IBaz' from singleton 'IFoo'." /* TODO */,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L42
test('GetService_Throws_WhenScopedIsInjectedIntoSingletonThroughSingleton', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonCtor(serviceCollection, IFoo, Foo);
	addSingletonCtor(serviceCollection, IBar, Bar2);
	addScopedCtor(serviceCollection, IBaz, Baz);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() => serviceProvider.getService<IFoo>(IFoo)).toThrowError(
		"Cannot consume scoped service 'IBaz' from singleton 'IBar'." /* TODO */,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L57
test('GetService_Throws_WhenScopedIsInjectedIntoSingletonThroughSingletonAndScopedWhileInScope', () => {
	const serviceCollection = new ServiceCollection();

	addScopedCtor(serviceCollection, IFoo, Foo);
	addSingletonCtor(serviceCollection, IBar, Bar2);
	addScopedCtor(serviceCollection, IBaz, Baz);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);
	const scope = serviceProvider.createScope();

	expect(() => scope.serviceProvider.getService<IFoo>(IFoo)).toThrowError(
		`Cannot consume scoped service '${keyForType(
			IBaz,
		)}' from singleton '${keyForType(IBar)}'.`,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L74
test('GetService_Throws_WhenGetServiceForScopedServiceIsCalledOnRoot', () => {
	const serviceCollection = new ServiceCollection();
	addScopedCtor(serviceCollection, IBar, Bar);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() => serviceProvider.getService<IBar>(IBar)).toThrowError(
		"Cannot resolve scoped service 'IBar' from root provider." /* TODO */,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L87
test('GetService_Throws_WhenGetServiceForScopedServiceIsCalledOnRootViaTransient', () => {
	const serviceCollection = new ServiceCollection();
	addTransientCtor(serviceCollection, IFoo, Foo);
	addScopedCtor(serviceCollection, IBar, Bar);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() => serviceProvider.getService<IFoo>(IFoo)).toThrowError(
		`Cannot resolve 'IFoo' from root provider because it requires scoped service 'IBar'.`,
	);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L101
test('GetService_DoesNotThrow_WhenScopeFactoryIsInjectedIntoSingleton', () => {
	const serviceCollection = new ServiceCollection();
	addSingletonCtor(serviceCollection, IBoo, Boo);
	const options = new ServiceProviderOptions();
	options.validateScopes = true;
	const serviceProvider = buildServiceProvider(serviceCollection, options);

	expect(() => serviceProvider.getService<IBoo>(IBoo)).not.toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L114
test('BuildServiceProvider_ValidateOnBuild_ThrowsForUnresolvableServices', () => {
	const serviceCollection = new ServiceCollection();
	addTransientCtor(serviceCollection, IFoo, Foo);
	addTransientCtor(serviceCollection, IBaz, BazRecursive);

	const options = new ServiceProviderOptions();
	options.validateOnBuild = true;
	try {
		buildServiceProvider(serviceCollection, options);
		throw new Error('Assertion failed');
	} catch (error) {
		if (error instanceof AggregateError) {
			expect(
				error.message.startsWith(
					'Some services are not able to be constructed',
				),
			).toBe(true);
			const innerErrors = Array.from(error.errors);
			expect(innerErrors.length).toBe(2);
			expect(innerErrors[0].message).toBe(
				"Error while validating the service descriptor 'serviceType: IFoo lifetime: Transient implCtor: Foo': " +
					"Error: Unable to resolve service for type 'IBar' while attempting to activate" +
					" 'Foo'.",
			);

			expect(innerErrors[1].message).toBe(
				"Error while validating the service descriptor 'serviceType: IBaz lifetime: Transient implCtor: BazRecursive': " +
					"Error: A circular dependency was detected for the service of type 'IBaz'." +
					'\n' +
					'IBaz(BazRecursive) ->' +
					' IBaz',
			);
		} else {
			throw new Error('Assertion failed.');
		}
	}
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/ServiceProviderValidationTests.cs#L149
test('BuildServiceProvider_ValidateOnBuild_ValidatesAllDescriptors', () => {
	const serviceCollection = new ServiceCollection();
	addTransientCtor(serviceCollection, IBaz, BazRecursive);
	addTransientCtor(serviceCollection, IBaz, Baz);

	try {
		const options = new ServiceProviderOptions();
		options.validateOnBuild = true;
		buildServiceProvider(serviceCollection, options);
		throw new Error('Assertion failed.');
	} catch (error) {
		if (error instanceof AggregateError) {
			expect(
				error.message.startsWith(
					'Some services are not able to be constructed',
				),
			).toBe(true);
			const innerErrors = Array.from(error.errors);
			expect(innerErrors.length).toBe(1);

			expect(innerErrors[0].message).toBe(
				"Error while validating the service descriptor 'serviceType: IBaz lifetime: Transient implCtor: BazRecursive': " +
					"Error: A circular dependency was detected for the service of type 'IBaz'." +
					'\n' +
					'IBaz(BazRecursive) ->' +
					' IBaz',
			);
		} else {
			throw new Error('Assertion failed.');
		}
	}
});

// TODO
