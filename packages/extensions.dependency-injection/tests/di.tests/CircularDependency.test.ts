import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
	addSingletonCtor,
	addSingletonInstance,
	addTransientCtor,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import { expect, test } from 'vitest';

import { DependencyOnCircularDependency } from './fakes/circular-references/DependencyOnCircularDependency';
import { DirectCircularDependencyA } from './fakes/circular-references/DirectCircularDependencyA';
import { DirectCircularDependencyB } from './fakes/circular-references/DirectCircularDependencyB';
import { ISelfCircularDependencyWithInterface } from './fakes/circular-references/ISelfCircularDependencyWithInterface';
import { IndirectCircularDependencyA } from './fakes/circular-references/IndirectCircularDependencyA';
import { IndirectCircularDependencyB } from './fakes/circular-references/IndirectCircularDependencyB';
import { IndirectCircularDependencyC } from './fakes/circular-references/IndirectCircularDependencyC';
import { NoCircularDependencySameTypeMultipleTimesA } from './fakes/circular-references/NoCircularDependencySameTypeMultipleTimesA';
import { NoCircularDependencySameTypeMultipleTimesB } from './fakes/circular-references/NoCircularDependencySameTypeMultipleTimesB';
import { NoCircularDependencySameTypeMultipleTimesC } from './fakes/circular-references/NoCircularDependencySameTypeMultipleTimesC';
import { SelfCircularDependency } from './fakes/circular-references/SelfCircularDependency';
import { SelfCircularDependencyGeneric } from './fakes/circular-references/SelfCircularDependencyGeneric';
import { SelfCircularDependencyWithInterface } from './fakes/circular-references/SelfCircularDependencyWithInterface';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L14
test('SelfCircularDependency', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'SelfCircularDependency'." +
		'\n' +
		'SelfCircularDependency -> ' +
		'SelfCircularDependency';

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		Symbol.for('SelfCircularDependency'),
		SelfCircularDependency,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependency>(
			serviceProvider,
			Symbol.for('SelfCircularDependency'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L33
test('SelfCircularDependencyInEnumerable', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'SelfCircularDependency'." +
		'\n' +
		'Iterable<SelfCircularDependency> -> ' +
		'SelfCircularDependency -> ' +
		'SelfCircularDependency';

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		Symbol.for('SelfCircularDependency'),
		SelfCircularDependency,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService(
			serviceProvider,
			Symbol.for('Iterable<SelfCircularDependency>'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L53
test('SelfCircularDependencyGenericDirect', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'SelfCircularDependencyGeneric<string>'." +
		'\n' +
		'SelfCircularDependencyGeneric<string>(SelfCircularDependencyGeneric) -> ' /* HACK */ +
		'SelfCircularDependencyGeneric<string>';

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		Symbol.for('SelfCircularDependencyGeneric<string>'),
		SelfCircularDependencyGeneric,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependencyGeneric<string>>(
			serviceProvider,
			Symbol.for('SelfCircularDependencyGeneric<string>'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L72
test('SelfCircularDependencyGenericIndirect', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'SelfCircularDependencyGeneric<string>'." +
		'\n' +
		'SelfCircularDependencyGeneric<number>(SelfCircularDependencyGeneric) -> ' /* HACK */ +
		'SelfCircularDependencyGeneric<string>(SelfCircularDependencyGeneric) -> ' /* HACK */ +
		'SelfCircularDependencyGeneric<string>';

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		Symbol.for('SelfCircularDependencyGeneric<number>'),
		SelfCircularDependencyGeneric,
	);
	$ = addTransientCtor(
		$,
		Symbol.for('SelfCircularDependencyGeneric<string>'),
		SelfCircularDependencyGeneric,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependencyGeneric<number>>(
			serviceProvider,
			Symbol.for('SelfCircularDependencyGeneric<number>'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L93
test('NoCircularDependencyGeneric', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonInstance(
		$,
		Symbol.for('SelfCircularDependencyGeneric<string>'),
		new SelfCircularDependencyGeneric<string>(),
	);
	$ = addTransientCtor(
		$,
		Symbol.for('SelfCircularDependencyGeneric<number>'),
		SelfCircularDependencyGeneric,
	);
	const serviceProvider = buildServiceProvider($);

	// This will not throw because we are creating an instance of the first time
	// using the parameterless constructor which has no circular dependency
	const resolvedService = getRequiredService<
		SelfCircularDependencyGeneric<number>
	>(serviceProvider, Symbol.for('SelfCircularDependencyGeneric<number>'));
	expect(resolvedService).not.toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L107
test('SelfCircularDependencyWithInterface', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'ISelfCircularDependencyWithInterface'.";

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		ISelfCircularDependencyWithInterface,
		SelfCircularDependencyWithInterface,
	);
	$ = addTransientCtor(
		$,
		Symbol.for('SelfCircularDependencyWithInterface'),
		SelfCircularDependencyWithInterface,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<SelfCircularDependencyWithInterface>(
			serviceProvider,
			Symbol.for('SelfCircularDependencyWithInterface'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L129
test('DirectCircularDependency', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'DirectCircularDependencyA'." +
		'\n' +
		'DirectCircularDependencyA -> ' +
		'DirectCircularDependencyB -> ' +
		'DirectCircularDependencyA';

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonCtor(
		$,
		Symbol.for('DirectCircularDependencyA'),
		DirectCircularDependencyA,
	);
	$ = addSingletonCtor(
		$,
		Symbol.for('DirectCircularDependencyB'),
		DirectCircularDependencyB,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<DirectCircularDependencyA>(
			serviceProvider,
			Symbol.for('DirectCircularDependencyA'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L150
test('IndirectCircularDependency', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'IndirectCircularDependencyA'." +
		'\n' +
		'IndirectCircularDependencyA -> ' +
		'IndirectCircularDependencyB -> ' +
		'IndirectCircularDependencyC -> ' +
		'IndirectCircularDependencyA';

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonCtor(
		$,
		Symbol.for('IndirectCircularDependencyA'),
		IndirectCircularDependencyA,
	);
	$ = addTransientCtor(
		$,
		Symbol.for('IndirectCircularDependencyB'),
		IndirectCircularDependencyB,
	);
	$ = addTransientCtor(
		$,
		Symbol.for('IndirectCircularDependencyC'),
		IndirectCircularDependencyC,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<IndirectCircularDependencyA>(
			serviceProvider,
			Symbol.for('IndirectCircularDependencyA'),
		),
	).toThrowError(expectedMessage);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L173
test('NoCircularDependencySameTypeMultipleTimes', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		Symbol.for('NoCircularDependencySameTypeMultipleTimesA'),
		NoCircularDependencySameTypeMultipleTimesA,
	);
	$ = addTransientCtor(
		$,
		Symbol.for('NoCircularDependencySameTypeMultipleTimesB'),
		NoCircularDependencySameTypeMultipleTimesB,
	);
	$ = addTransientCtor(
		$,
		Symbol.for('NoCircularDependencySameTypeMultipleTimesC'),
		NoCircularDependencySameTypeMultipleTimesC,
	);
	const serviceProvider = buildServiceProvider($);

	const resolvedService =
		getRequiredService<NoCircularDependencySameTypeMultipleTimesA>(
			serviceProvider,
			Symbol.for('NoCircularDependencySameTypeMultipleTimesA'),
		);
	expect(resolvedService).not.toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection/tests/DI.Tests/CircularDependencyTests.cs#L186
test('DependencyOnCircularDependency', () => {
	const expectedMessage =
		"A circular dependency was detected for the service of type 'DirectCircularDependencyA'." +
		'\n' +
		'DependencyOnCircularDependency -> ' +
		'DirectCircularDependencyA -> ' +
		'DirectCircularDependencyB -> ' +
		'DirectCircularDependencyA';

	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addTransientCtor(
		$,
		Symbol.for('DependencyOnCircularDependency'),
		DependencyOnCircularDependency,
	);
	$ = addTransientCtor(
		$,
		Symbol.for('DirectCircularDependencyA'),
		DirectCircularDependencyA,
	);
	$ = addTransientCtor(
		$,
		Symbol.for('DirectCircularDependencyB'),
		DirectCircularDependencyB,
	);
	const serviceProvider = buildServiceProvider($);

	expect(() =>
		getRequiredService<DependencyOnCircularDependency>(
			serviceProvider,
			Symbol.for('DependencyOnCircularDependency'),
		),
	).toThrowError(expectedMessage);
});
