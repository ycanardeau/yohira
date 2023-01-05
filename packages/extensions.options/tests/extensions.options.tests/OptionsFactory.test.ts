import { Type } from '@yohira/base/Type';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection/ServiceCollectionContainerBuilderExtensions';
import { IOptionsFactory } from '@yohira/extensions.options/IOptionsFactory';
import { configureNamedOptionsServices } from '@yohira/extensions.options/OptionsServiceCollectionExtensions';
import { expect, test } from 'vitest';

import { FakeOptions } from './FakeOptions';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsFactoryTests.cs#L13
test('CreateSupportsNames', () => {
	const services = new ServiceCollection();
	configureNamedOptionsServices(services, FakeOptions, '1', (options) => {
		options.message = 'one';
	});
	configureNamedOptionsServices(services, FakeOptions, '2', (options) => {
		options.message = 'two';
	});

	const sp = buildServiceProvider(services);
	const factory = getRequiredService<IOptionsFactory<FakeOptions>>(
		sp,
		Type.from('IOptionsFactory<FakeOptions>'),
	);
	expect(factory.create(FakeOptions, '1').message).toBe('one');
	expect(factory.create(FakeOptions, '2').message).toBe('two');
});

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsFactoryTests.cs#L26
test('NamesAreCaseSensitive', () => {
	const services = new ServiceCollection();
	configureNamedOptionsServices(services, FakeOptions, 'UP', (options) => {
		options.message = 'UP';
	});
	configureNamedOptionsServices(services, FakeOptions, 'up', (options) => {
		options.message = 'up';
	});

	const sp = buildServiceProvider(services);
	const factory = getRequiredService<IOptionsFactory<FakeOptions>>(
		sp,
		Type.from('IOptionsFactory<FakeOptions>'),
	);
	expect(factory.create(FakeOptions, 'UP').message).toBe('UP');
	expect(factory.create(FakeOptions, 'up').message).toBe('up');
});

// TODO
