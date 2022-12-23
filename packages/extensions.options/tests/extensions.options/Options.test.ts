import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollection';
import { addSingletonType } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { tryAdd } from '@yohira/extensions.dependency-injection.abstractions/extensions/ServiceCollectionDescriptorExtensions';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection/ServiceCollectionContainerBuilderExtensions';
import { IOptions } from '@yohira/extensions.options/IOptions';
import { Options } from '@yohira/extensions.options/Options';
import { UnnamedOptionsManager } from '@yohira/extensions.options/UnnamedOptionsManager';
import { expect, test } from 'vitest';

import { FakeOptions } from './FakeOptions';
import { FakeOptionsFactory } from './FakeOptionsFactory';

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
	return services;
};

// TODO: Remove.
// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,a6eee6a022a93bdc,references
const configureNamedOptionsServices = <TOptions>(
	services: IServiceCollection,
	optionsType: new (...args: never[]) => TOptions,
	name: string | undefined,
	configureOptions: (options: TOptions) => void,
): IServiceCollection => {
	addOptions(services);
	// TODO
	return services;
};

// TODO: Remove.
// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,b5db69a84107f087,references
export const configureOptionsServices = <TOptions>(
	services: IServiceCollection,
	optionsType: new (...args: never[]) => TOptions,
	configureOptions: (options: TOptions) => void,
): IServiceCollection => {
	return configureNamedOptionsServices(
		services,
		optionsType,
		Options.defaultName,
		configureOptions,
	);
};

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Options/tests/Microsoft.Extensions.Options.Tests/OptionsTest.cs#L18
test('UsesFactory', () => {
	const services = new ServiceCollection();
	addSingletonType(
		services,
		'IOptionsFactory<FakeOptions>',
		FakeOptionsFactory,
	);
	configureOptionsServices(services, FakeOptions, (o) => {
		o.message = 'Ignored';
	});
	const provider = buildServiceProvider(services);

	const snap = getRequiredService<IOptions<FakeOptions>>(
		provider,
		'IOptions<FakeOptions>',
	);
	expect(snap.value).toBe(FakeOptionsFactory.options);
});

// TODO
