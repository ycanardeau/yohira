import { IServiceProvider, Type } from '@yohira/base';
import {
	IServiceCollection,
	addSingletonFactory,
	addSingletonInstance,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	HostBuilderContext,
	IHost,
} from '@yohira/extensions.hosting.abstractions';
import { addLogging } from '@yohira/extensions.logging';
import { ILoggerT } from '@yohira/extensions.logging.abstractions';
import { HostingEnv } from '@yohira/hosting';

import { Host } from './internal/Host';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,afe23a39fda43335,references
export function createHostingEnv(): { hostingEnv: HostingEnv } {
	const hostingEnv = new HostingEnv();
	// TODO
	hostingEnv.contentRootPath = ''; /* TODO */

	// TODO

	return { hostingEnv: hostingEnv };
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,a8c4578a1465d84d,references
export function populateServiceCollection(
	services: IServiceCollection,
	hostBuilderContext: HostBuilderContext,
	serviceProviderGetter: () => IServiceProvider,
): void {
	// TODO
	addSingletonInstance(
		services,
		Type.from('HostBuilderContext'),
		hostBuilderContext,
	);
	// TODO

	addSingletonFactory(services, Type.from('IHost'), () => {
		const appServices = serviceProviderGetter();
		return new Host(
			appServices,
			getRequiredService<ILoggerT<Host>>(
				appServices,
				Type.from('ILoggerT<Host>'),
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
