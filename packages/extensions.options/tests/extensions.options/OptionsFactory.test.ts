import { Ctor } from '@yohira/base/Type';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import { addSingletonInstance } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { tryAdd } from '@yohira/extensions.dependency-injection.abstractions/extensions/ServiceCollectionDescriptorExtensions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection/ServiceCollectionContainerBuilderExtensions';
import { ConfigureNamedOptions } from '@yohira/extensions.options/ConfigureNamedOptions';
import { IOptionsFactory } from '@yohira/extensions.options/IOptionsFactory';
import { Options } from '@yohira/extensions.options/Options';
import { OptionsFactory } from '@yohira/extensions.options/OptionsFactory';
import { UnnamedOptionsManager } from '@yohira/extensions.options/UnnamedOptionsManager';
import { FakeOptions } from 'packages/extensions.options/tests/extensions.options/FakeOptions';
import { expect, test } from 'vitest';

// TODO: Remove.
// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,4909ed65f60d1c84,references
const addOptions = (services: IServiceCollection): IServiceCollection => {
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			'IOptions<>',
			UnnamedOptionsManager,
		),
	);
	// TODO
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			'IOptionsFactory<>',
			OptionsFactory,
		),
	);
	// TODO
	return services;
};

// TODO: Remove.
// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,a6eee6a022a93bdc,references
const configureNamedOptionsServices = <TOptions>(
	services: IServiceCollection,
	optionsCtor: Ctor<TOptions>,
	name: string | undefined,
	configureOptions: (options: TOptions) => void,
): IServiceCollection => {
	addOptions(services);
	addSingletonInstance(
		services,
		`IConfigureOptions<${optionsCtor.name}>`,
		new ConfigureNamedOptions(name, configureOptions),
	);
	return services;
};

// TODO: Remove.
// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,b5db69a84107f087,references
export const configureOptionsServices = <TOptions>(
	services: IServiceCollection,
	optionsCtor: Ctor<TOptions>,
	configureOptions: (options: TOptions) => void,
): IServiceCollection => {
	return configureNamedOptionsServices(
		services,
		optionsCtor,
		Options.defaultName,
		configureOptions,
	);
};

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
		'IOptionsFactory<FakeOptions>',
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
		'IOptionsFactory<FakeOptions>',
	);
	expect(factory.create(FakeOptions, 'UP').message).toBe('UP');
	expect(factory.create(FakeOptions, 'up').message).toBe('up');
});

// TODO
