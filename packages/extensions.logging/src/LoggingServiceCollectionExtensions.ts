import { Type } from '@yohira/base/Type';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';
import { tryAdd } from '@yohira/extensions.dependency-injection.abstractions/extensions/ServiceCollectionDescriptorExtensions';
import { LoggerT } from '@yohira/extensions.logging.abstractions/LoggerT';
import { LoggerFactory } from '@yohira/extensions.logging/LoggerFactory';
import { addOptions } from '@yohira/extensions.options/OptionsServiceCollectionExtensions';

// https://source.dot.net/#Microsoft.Extensions.Logging/LoggingServiceCollectionExtensions.cs,3bb7fda06894cc18,references
export const addLogging = (
	services: IServiceCollection,
): IServiceCollection => {
	addOptions(services);

	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Type.from('ILoggerFactory'),
			LoggerFactory,
		),
	);
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Type.from('ILogger<>'),
			LoggerT,
		),
	);

	// TODO

	// TODO
	return services;
};
