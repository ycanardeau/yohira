import { Ctor } from '@yohira/base';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	addSingletonInstance,
	tryAddServiceDescriptor,
} from '@yohira/extensions.dependency-injection.abstractions';

import { ConfigureNamedOptions } from './ConfigureNamedOptions';
import { Options } from './Options';
import { OptionsBuilder } from './OptionsBuilder';
import { OptionsCache } from './OptionsCache';
import { OptionsFactory } from './OptionsFactory';
import { OptionsMonitor } from './OptionsMonitor';
import { UnnamedOptionsManager } from './UnnamedOptionsManager';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,4909ed65f60d1c84,references
export function addOptions(services: IServiceCollection): IServiceCollection {
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IOptions<>'),
			UnnamedOptionsManager,
		),
	);
	// TODO
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IOptionsMonitor<>'),
			OptionsMonitor,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Transient,
			Symbol.for('IOptionsFactory<>'),
			OptionsFactory,
		),
	);
	tryAddServiceDescriptor(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IOptionsMonitorCache<>'),
			OptionsCache,
		),
	);
	return services;
}

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,a6eee6a022a93bdc,references
export function configureNamedOptionsServices<TOptions>(
	optionsCtor: Ctor<TOptions>,
	services: IServiceCollection,
	name: string | undefined,
	configureOptions: (options: TOptions) => void,
): IServiceCollection {
	addOptions(services);
	addSingletonInstance(
		services,
		Symbol.for(`IConfigureOptions<${optionsCtor.name}>`),
		new ConfigureNamedOptions(name, configureOptions),
	);
	return services;
}

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,b5db69a84107f087,references
export function configureOptionsServices<TOptions>(
	optionsCtor: Ctor<TOptions>,
	services: IServiceCollection,
	configureOptions: (options: TOptions) => void,
): IServiceCollection {
	return configureNamedOptionsServices(
		optionsCtor,
		services,
		Options.defaultName,
		configureOptions,
	);
}

export function addOptionsWithName<TOptions>(
	services: IServiceCollection,
	name: string | undefined,
): OptionsBuilder<TOptions> {
	addOptions(services);
	return new OptionsBuilder<TOptions>(services, name);
}
