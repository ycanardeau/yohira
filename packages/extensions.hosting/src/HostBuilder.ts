import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { addSingletonFactory } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions/ServiceProviderServiceExtensions';
import { IHost } from '@yohira/extensions.hosting.abstractions/IHost';
import { Host } from '@yohira/extensions.hosting/internal/Host';
import { ILoggerT } from '@yohira/extensions.logging.abstractions/ILoggerT';
import { addLogging } from '@yohira/extensions.logging/LoggingServiceCollectionExtensions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,a8c4578a1465d84d,references
export const populateServiceCollection = (
	services: IServiceCollection,
	serviceProviderGetter: () => IServiceProvider,
): void => {
	// TODO

	addSingletonFactory(services, 'IHost', () => {
		const appServices = serviceProviderGetter();
		return new Host(
			appServices,
			getRequiredService<ILoggerT<Host>>(appServices, 'ILogger<Host>'),
		);
	});
	// TODO
	addLogging(services);
};

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,328ee38355596558,references
export const resolveHost = (
	serviceProvider: IServiceProvider /* TODO */,
): IHost => {
	// TODO

	const host = getRequiredService<IHost>(serviceProvider, 'IHost');

	// TODO

	return host;
};
