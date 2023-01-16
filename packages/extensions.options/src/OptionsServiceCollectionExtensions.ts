import { ConfigureNamedOptions } from '@/ConfigureNamedOptions';
import { Options } from '@/Options';
import { OptionsCache } from '@/OptionsCache';
import { OptionsFactory } from '@/OptionsFactory';
import { OptionsMonitor } from '@/OptionsMonitor';
import { UnnamedOptionsManager } from '@/UnnamedOptionsManager';
import { Ctor, Type } from '@yohira/base';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addSingletonInstance,
	tryAdd,
} from '@yohira/extensions.dependency-injection.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,4909ed65f60d1c84,references
export function addOptions(services: IServiceCollection): IServiceCollection {
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
}

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,a6eee6a022a93bdc,references
export function configureNamedOptionsServices<TOptions>(
	services: IServiceCollection,
	optionsCtor: Ctor<TOptions>,
	name: string | undefined,
	configureOptions: (options: TOptions) => void,
): IServiceCollection {
	addOptions(services);
	addSingletonInstance(
		services,
		Type.from(`IConfigureOptions<${optionsCtor.name}>`),
		new ConfigureNamedOptions(name, configureOptions),
	);
	return services;
}

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,b5db69a84107f087,references
export function configureOptionsServices<TOptions>(
	services: IServiceCollection,
	optionsCtor: Ctor<TOptions>,
	configureOptions: (options: TOptions) => void,
): IServiceCollection {
	return configureNamedOptionsServices(
		services,
		optionsCtor,
		Options.defaultName,
		configureOptions,
	);
}
