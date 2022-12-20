import { ILoggerFactory } from '@yohira/logging.abstractions/ILoggerFactory';
import { LoggerFactory } from '@yohira/logging/LoggerFactory';
import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Logging/LoggingServiceCollectionExtensions.cs,3bb7fda06894cc18,references
export const addLogging = (services: Container): Container => {
	// TODO: addOptions(services);

	services.bind(ILoggerFactory).to(LoggerFactory).inSingletonScope();
	// TODO

	// TODO
	return services;
};
