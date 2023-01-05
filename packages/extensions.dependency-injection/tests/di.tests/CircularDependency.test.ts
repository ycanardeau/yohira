import { Type } from '@yohira/base/Type';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import {
	addSingletonCtor,
	addSingletonInstance,
	addTransientCtor,
} from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection/ServiceCollectionContainerBuilderExtensions';
import { expect, test } from 'vitest';

import { DependencyOnCircularDependency } from './fakes/circular-references/DependencyOnCircularDependency';
import { DirectCircularDependencyA } from './fakes/circular-references/DirectCircularDependencyA';
import { DirectCircularDependencyB } from './fakes/circular-references/DirectCircularDependencyB';
import { IndirectCircularDependencyA } from './fakes/circular-references/IndirectCircularDependencyA';
import { IndirectCircularDependencyB } from './fakes/circular-references/IndirectCircularDependencyB';
import { IndirectCircularDependencyC } from './fakes/circular-references/IndirectCircularDependencyC';
import { NoCircularDependencySameTypeMultipleTimesA } from './fakes/circular-references/NoCircularDependencySameTypeMultipleTimesA';
import { NoCircularDependencySameTypeMultipleTimesB } from './fakes/circular-references/NoCircularDependencySameTypeMultipleTimesB';
import { NoCircularDependencySameTypeMultipleTimesC } from './fakes/circular-references/NoCircularDependencySameTypeMultipleTimesC';
import { SelfCircularDependency } from './fakes/circular-references/SelfCircularDependency';
import { SelfCircularDependencyGeneric } from './fakes/circular-references/SelfCircularDependencyGeneric';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L14
test('SelfCircularDependency', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'SelfCircularDependency'.";

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		Type.from('SelfCircularDependency'),
		SelfCircularDependency,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependency>(
			serviceProvider,
			Type.from('SelfCircularDependency'),
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
		Type.from('SelfCircularDependencyGeneric<string>'),
		SelfCircularDependencyGeneric,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependencyGeneric<string>>(
			serviceProvider,
			Type.from('SelfCircularDependencyGeneric<string>'),
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
		Type.from('SelfCircularDependencyGeneric<number>'),
		SelfCircularDependencyGeneric,
	);
	$ = addTransientCtor(
		$,
		Type.from('SelfCircularDependencyGeneric<string>'),
		SelfCircularDependencyGeneric,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependencyGeneric<number>>(
			serviceProvider,
			Type.from('SelfCircularDependencyGeneric<number>'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L93
test('NoCircularDependencyGeneric', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonInstance(
		$,
		Type.from('SelfCircularDependencyGeneric<string>'),
		new SelfCircularDependencyGeneric<string>(),
	);
	$ = addTransientCtor(
		$,
		Type.from('SelfCircularDependencyGeneric<number>'),
		SelfCircularDependencyGeneric,
	);
	const serviceProvider = buildServiceProvider($);

	// This will not throw because we are creating an instance of the first time
	// using the parameterless constructor which has no circular dependency
	const resolvedService = getRequiredService<
		SelfCircularDependencyGeneric<number>
	>(serviceProvider, Type.from('SelfCircularDependencyGeneric<number>'));
	expect(resolvedService).not.toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L129
test('DirectCircularDependency', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'DirectCircularDependencyA'.";

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonCtor(
		$,
		Type.from('DirectCircularDependencyA'),
		DirectCircularDependencyA,
	);
	$ = addSingletonCtor(
		$,
		Type.from('DirectCircularDependencyB'),
		DirectCircularDependencyB,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<DirectCircularDependencyA>(
			serviceProvider,
			Type.from('DirectCircularDependencyA'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L150
test('IndirectCircularDependency', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'IndirectCircularDependencyA'.";

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonCtor(
		$,
		Type.from('IndirectCircularDependencyA'),
		IndirectCircularDependencyA,
	);
	$ = addTransientCtor(
		$,
		Type.from('IndirectCircularDependencyB'),
		IndirectCircularDependencyB,
	);
	$ = addTransientCtor(
		$,
		Type.from('IndirectCircularDependencyC'),
		IndirectCircularDependencyC,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<IndirectCircularDependencyA>(
			serviceProvider,
			Type.from('IndirectCircularDependencyA'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L173
test('NoCircularDependencySameTypeMultipleTimes', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		Type.from('NoCircularDependencySameTypeMultipleTimesA'),
		NoCircularDependencySameTypeMultipleTimesA,
	);
	$ = addTransientCtor(
		$,
		Type.from('NoCircularDependencySameTypeMultipleTimesB'),
		NoCircularDependencySameTypeMultipleTimesB,
	);
	$ = addTransientCtor(
		$,
		Type.from('NoCircularDependencySameTypeMultipleTimesC'),
		NoCircularDependencySameTypeMultipleTimesC,
	);
	const serviceProvider = buildServiceProvider($);

	const resolvedService =
		getRequiredService<NoCircularDependencySameTypeMultipleTimesA>(
			serviceProvider,
			Type.from('NoCircularDependencySameTypeMultipleTimesA'),
		);
	expect(resolvedService).not.toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L186
test('DependencyOnCircularDependency', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'DirectCircularDependencyA'.";

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		Type.from('DependencyOnCircularDependency'),
		DependencyOnCircularDependency,
	);
	$ = addTransientCtor(
		$,
		Type.from('DirectCircularDependencyA'),
		DirectCircularDependencyA,
	);
	$ = addTransientCtor(
		$,
		Type.from('DirectCircularDependencyB'),
		DirectCircularDependencyB,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<DependencyOnCircularDependency>(
			serviceProvider,
			Type.from('DependencyOnCircularDependency'),
		),
	).toThrowError(expectedMessage);
});
