import {
	IServiceCollection,
	ServiceCollection,
} from '@/dependency-injection/ServiceCollection';
import {
	IServiceProvider,
	ServiceProvider,
} from '@/dependency-injection/ServiceProvider';
import { Host } from '@/hosting/Host';
import { IHost } from '@/hosting/IHost';

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

	constructor() {
		this.createServiceProvider = (): IServiceProvider => {
			return buildServiceProvider(this.services); /* TODO */
		};
	}

	// https://github.com/dotnet/runtime/blob/30dc7e7aedb7aab085c7d9702afeae5bc5a43133/src/libraries/Microsoft.Extensions.Hosting/src/HostApplicationBuilder.cs#L214
	build = (): IHost => {
		this.appServices = this.createServiceProvider();

		return resolveHost(this.appServices /* TODO */);
	};
}
