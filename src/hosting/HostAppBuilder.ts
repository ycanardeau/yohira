import {
	IServiceCollection,
	ServiceCollection,
} from '@/dependency-injection/ServiceCollection';
import { singleton } from '@/dependency-injection/ServiceDescriptor';
import {
	IServiceProvider,
	ServiceProvider,
} from '@/dependency-injection/ServiceProvider';
import { Host } from '@/hosting/Host';
import { IHost } from '@/hosting/IHost';
import { LoggerFactory } from '@/logging/Logger';
import { SR } from '@/sr';
import { TYPES } from '@/types';

// https://github.com/dotnet/runtime/blob/b77aa8a9726503df52327a0388a3f4a0325989e1/src/libraries/Microsoft.Extensions.Logging/src/LoggingServiceCollectionExtensions.cs#L32
const addLogging = (services: IServiceCollection): IServiceCollection => {
	// TODO

	services.push(
		/* TODO: tryAdd */ singleton(
			TYPES.ILoggerFactory,
			undefined,
			LoggerFactory,
		),
	);

	// TODO
	return services;
};

// https://github.com/dotnet/runtime/blob/b77aa8a9726503df52327a0388a3f4a0325989e1/src/libraries/Microsoft.Extensions.Hosting/src/HostBuilder.cs#L289
const populateServiceCollection = (services: IServiceCollection): void => {
	// TODO

	addLogging(services);
};

// https://github.com/dotnet/runtime/blob/199436b51fba6f0bee469c63ee42fa266d70222d/src/libraries/Microsoft.Extensions.DependencyInjection/src/ServiceCollectionContainerBuilderExtensions.cs#L53
const buildServiceProvider = (
	services: IServiceCollection /* TODO */,
): ServiceProvider => {
	return new ServiceProvider(services /* TODO */);
};

// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostBuilder.cs#L356
const resolveHost = (serviceProvider: IServiceProvider): IHost => {
	// TODO
	const host = new Host(serviceProvider, { isEnabled: () => true });

	return host;
};

// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostApplicationBuilder.cs#L20
export class HostAppBuilder {
	readonly services = new ServiceCollection();

	private createServiceProvider: () => IServiceProvider;

	private appServices?: IServiceProvider;
	private hostBuilt = false;

	constructor() {
		// TODO

		populateServiceCollection(this.services /* TODO */);

		// TODO

		this.createServiceProvider = (): IServiceProvider => {
			return buildServiceProvider(this.services); /* TODO */
		};
	}

	// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostApplicationBuilder.cs#L214
	build = (): IHost => {
		if (this.hostBuilt) {
			throw new Error(
				SR.BuildCalled,
			) /* TODO: InvalidOperationException */;
		}

		this.hostBuilt = true;

		this.appServices = this.createServiceProvider();

		this.services.makeReadOnly();

		return resolveHost(this.appServices /* TODO */);
	};
}
