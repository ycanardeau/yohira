import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import { addTransientCtor } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection/ServiceCollectionContainerBuilderExtensions';
import { expect, test } from 'vitest';

import { SelfCircularDependency } from './fakes/circular-references/SelfCircularDependency';
import { SelfCircularDependencyGeneric } from './fakes/circular-references/SelfCircularDependencyGeneric';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L14
test('SelfCircularDependency', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'SelfCircularDependency'.";

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor($, 'SelfCircularDependency', SelfCircularDependency);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependency>(
			serviceProvider,
			'SelfCircularDependency',
		),
	).toThrowError(expectedMessage);
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L53
test('SelfCircularDependencyGenericDirect', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'SelfCircularDependencyGeneric<string>'.";

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		'SelfCircularDependencyGeneric<string>',
		SelfCircularDependencyGeneric,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependencyGeneric<string>>(
			serviceProvider,
			'SelfCircularDependencyGeneric<string>',
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L72
test('SelfCircularDependencyGenericIndirect', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'SelfCircularDependencyGeneric<string>'.";

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		'SelfCircularDependencyGeneric<number>',
		SelfCircularDependencyGeneric,
	);
	$ = addTransientCtor(
		$,
		'SelfCircularDependencyGeneric<string>',
		SelfCircularDependencyGeneric,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependencyGeneric<number>>(
			serviceProvider,
			'SelfCircularDependencyGeneric<number>',
		),
	).toThrowError(expectedMessage);
});

// TODO
