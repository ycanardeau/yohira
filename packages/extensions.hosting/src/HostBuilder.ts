import { IServiceProvider } from '@yohira/base';
import { IConfig } from '@yohira/extensions.config.abstractions';
import {
	IServiceCollection,
	addSingletonFactory,
	addSingletonInstance,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	Envs,
	HostBuilderContext,
	HostDefaults,
	IHost,
} from '@yohira/extensions.hosting.abstractions';
import { addLogging } from '@yohira/extensions.logging';
import { ILoggerT } from '@yohira/extensions.logging.abstractions';
import { HostingEnv } from '@yohira/hosting';

import { Host } from './internal/Host';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,afe23a39fda43335,references
export function createHostingEnv(hostConfig: IConfig): {
	hostingEnv: HostingEnv;
} {
	const hostingEnv = new HostingEnv();
	hostingEnv.envName = hostConfig.get(HostDefaults.EnvKey) ?? Envs.Production;
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
		Symbol.for('HostBuilderContext'),
		hostBuilderContext,
	);
	// TODO

	addSingletonFactory(services, IHost, () => {
		const appServices = serviceProviderGetter();
		return new Host(
			appServices,
			getRequiredService<ILoggerT<Host>>(
				appServices,
				Symbol.for('ILoggerT<Host>'),
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

	const host = getRequiredService<IHost>(serviceProvider, IHost);

	// TODO

	return host;
}
