import { Host } from '@/internal/Host';
import { IServiceProvider, Type } from '@yohira/base';
import {
	IServiceCollection,
	addSingletonFactory,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import { IHost } from '@yohira/extensions.hosting.abstractions';
import { addLogging } from '@yohira/extensions.logging';
import { ILoggerT } from '@yohira/extensions.logging.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,a8c4578a1465d84d,references
export function populateServiceCollection(
	services: IServiceCollection,
	serviceProviderGetter: () => IServiceProvider,
): void {
	// TODO

	addSingletonFactory(services, Type.from('IHost'), () => {
		const appServices = serviceProviderGetter();
		return new Host(
			appServices,
			getRequiredService<ILoggerT<Host>>(
				appServices,
				Type.from('ILogger<Host>'),
			),
		);
	});
	// TODO
	addLogging(services);
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,328ee38355596558,references
export function resolveHost(
	serviceProvider: IServiceProvider /* TODO */,
): IHost {
	// TODO

	const host = getRequiredService<IHost>(serviceProvider, Type.from('IHost'));

	// TODO

	return host;
}
