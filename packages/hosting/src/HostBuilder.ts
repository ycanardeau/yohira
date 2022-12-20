import { IHost } from '@yohira/hosting.abstractions/IHost';
import { Host } from '@yohira/hosting/internal/Host';
import { ILoggerFactory } from '@yohira/logging.abstractions/ILoggerFactory';
import { addLogging } from '@yohira/logging/LoggingServiceCollectionExtensions';
import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,a8c4578a1465d84d,references
export const populateServiceCollection = (services: Container): void => {
	// TODO

	services.bind(IHost).toDynamicValue(() => {
		// TODO
		return new Host(
			services,
			services
				.get<ILoggerFactory>(ILoggerFactory)
				.createLogger(Host) /* TODO */,
		);
	});
	// TODO
	addLogging(services);
};

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,328ee38355596558,references
export const resolveHost = (serviceProvider: Container /* TODO */): IHost => {
	// TODO

	const host = serviceProvider.get<IHost>(IHost);

	// TODO

	return host;
};
