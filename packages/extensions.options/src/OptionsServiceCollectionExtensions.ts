import { Ctor, Type } from '@yohira/base/Type';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { addSingletonInstance } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';
import { tryAdd } from '@yohira/extensions.dependency-injection.abstractions/extensions/ServiceCollectionDescriptorExtensions';
import { ConfigureNamedOptions } from '@yohira/extensions.options/ConfigureNamedOptions';
import { Options } from '@yohira/extensions.options/Options';
import { OptionsCache } from '@yohira/extensions.options/OptionsCache';
import { OptionsFactory } from '@yohira/extensions.options/OptionsFactory';
import { OptionsMonitor } from '@yohira/extensions.options/OptionsMonitor';
import { UnnamedOptionsManager } from '@yohira/extensions.options/UnnamedOptionsManager';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,4909ed65f60d1c84,references
export const addOptions = (
	services: IServiceCollection,
): IServiceCollection => {
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Type.from('IOptions<>'),
			UnnamedOptionsManager,
		),
	);
	// TODO
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Type.from('IOptionsMonitor<>'),
			OptionsMonitor,
		),
	);
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			Type.from('IOptionsFactory<>'),
			OptionsFactory,
		),
	);
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Type.from('IOptionsMonitorCache<>'),
			OptionsCache,
		),
	);
	return services;
};

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,a6eee6a022a93bdc,references
export const configureNamedOptionsServices = <TOptions>(
	services: IServiceCollection,
	optionsCtor: Ctor<TOptions>,
	name: string | undefined,
	configureOptions: (options: TOptions) => void,
): IServiceCollection => {
	addOptions(services);
	addSingletonInstance(
		services,
		Type.from(`IConfigureOptions<${optionsCtor.name}>`),
		new ConfigureNamedOptions(name, configureOptions),
	);
	return services;
};

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
