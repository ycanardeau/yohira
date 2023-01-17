import { Type } from '@yohira/base';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAdd,
} from '@yohira/extensions.dependency-injection.abstractions';
import { LoggerT } from '@yohira/extensions.logging.abstractions';
import { addOptions } from '@yohira/extensions.options';

import { LoggerFactory } from './LoggerFactory';

// https://source.dot.net/#Microsoft.Extensions.Logging/LoggingServiceCollectionExtensions.cs,3bb7fda06894cc18,references
export function addLogging(services: IServiceCollection): IServiceCollection {
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
}
