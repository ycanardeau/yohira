import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';
import { tryAdd } from '@yohira/extensions.dependency-injection.abstractions/extensions/ServiceCollectionDescriptorExtensions';
import { Logger } from '@yohira/extensions.logging.abstractions/Logger';
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
			'ILoggerFactory',
			LoggerFactory,
		),
	);
	tryAdd(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			'ILogger<>',
			Logger,
		),
	);

	// TODO

	// TODO
	return services;
};
