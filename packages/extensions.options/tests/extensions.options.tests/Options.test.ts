import {
	ConfigBuilder,
	addInMemoryCollection,
} from '@yohira/extensions.config';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
	addSingletonCtor,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	IOptions,
	addOptions,
	configureOptionsServices,
} from '@yohira/extensions.options';
import { configureOptionsConfigServices } from '@yohira/extensions.options.config-extensions';
import { expect, test } from 'vitest';

import { ComplexOptions, DerivedOptions } from './ComplexOptions';
import { FakeOptions } from './FakeOptions';
import { FakeOptionsFactory } from './FakeOptionsFactory';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsTest.cs#L18
test('UsesFactory', () => {
	let $: IServiceCollection;
	$ = new ServiceCollection();
	$ = addSingletonCtor(
		$,
		Symbol.for('IOptionsFactory<FakeOptions>'),
		FakeOptionsFactory,
	);
	$ = configureOptionsServices(FakeOptions, $, (o) => {
		o.message = 'Ignored';
	});
	const services = buildServiceProvider($);

	const snap = getRequiredService<IOptions<FakeOptions>>(
		services,
		Symbol.for('IOptions<FakeOptions>'),
	);
	expect(snap.getValue(FakeOptions)).toBe(FakeOptionsFactory.options);
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsTest.cs#L30
test('CanReadComplexProperties', () => {
	const dic = { integer: '-2', boolean: 'TRUe', 'nested:integer': '11' };
	const services = new ServiceCollection();
	configureOptionsConfigServices(
		ComplexOptions,
		services,
		addInMemoryCollection(new ConfigBuilder(), dic).buildSync(),
	);
	const sp = buildServiceProvider(services);
	const options = getRequiredService<IOptions<ComplexOptions>>(
		sp,
		Symbol.for('IOptions<ComplexOptions>'),
	).getValue(ComplexOptions);
	expect(options.boolean).toBe(true);
	expect(options.integer).toBe(-2);
	expect(options.nested.integer).toBe(11);
});

/* TODO: // https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsTest.cs#L48
test('CanReadInheritedProperties', () => {
	const dic = {
		integer: '-2',
		boolean: 'TRUe',
		'nested:integer': '11',
		virtual: 'sup',
	};
	const services = new ServiceCollection();
	configureOptionsConfigServices(
		services,
		DerivedOptions,
		addInMemoryCollection(new ConfigBuilder(), dic).buildSync(),
	);
	const sp = buildServiceProvider(services);
	const options = getRequiredService<IOptions<DerivedOptions>>(
		sp,
		Symbol.for('IOptions<DerivedOptions>'),
	).getValue(DerivedOptions);
	expect(options.boolean).toBe(true);
	expect(options.integer).toBe(-2);
	expect(options.nested.integer).toBe(11);
	expect(options.virtual).toBe('derived:sup');
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsTest.cs#L68
test('CanReadStaticProperty', () => {
	const dic = {
		staticProperty: 'stuff',
	};
	const services = new ServiceCollection();
	configureOptionsConfigServices(
		services,
		ComplexOptions,
		addInMemoryCollection(new ConfigBuilder(), dic).buildSync(),
	);
	const sp = buildServiceProvider(services);
	getRequiredService<IOptions<ComplexOptions>>(
		sp,
		Symbol.for('IOptions<ComplexOptions>'),
	).getValue(ComplexOptions);
	expect(ComplexOptions.staticProperty).toBe('stuff');
});

// TODO

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsTest.cs#L134
test('SetupCallsInOrder', () => {
	const services = addOptions(new ServiceCollection());
	const dic = {
		message: '!',
	};
	const builder = addInMemoryCollection(new ConfigBuilder(), dic);
	const config = builder.buildSync();
	configureOptionsServices(services, FakeOptions, (o) => {
		o.message += 'igetstomped';
	});
	configureOptionsConfigServices(services, FakeOptions, config);
	configureOptionsServices(services, FakeOptions, (o) => {
		o.message += 'a';
	});
	configureOptionsServices(services, FakeOptions, (o) => {
		o.message += 'z';
	});

	const service = buildServiceProvider(services).getService<
		IOptions<FakeOptions>
	>(Symbol.for('IOptions<FakeOptions>'));
	expect(service).not.toBeUndefined();
	if (service === undefined) {
		throw new Error();
	}
	const options = service.getValue(FakeOptions);
	expect(options).not.toBeUndefined();
	expect(options.message).toBe('!az');
}); */

// TODO
