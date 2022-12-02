import { IServiceCollection } from '@/dependency-injection/ServiceCollection';
import { HostAppBuilder } from '@/hosting/HostAppBuilder';
import { IHostBuilder } from '@/hosting/IHostBuilder';

// https://github.com/dotnet/aspnetcore/blob/313ee06a672385ede5d2c9a01d31a7d9d35a6340/src/DefaultBuilder/src/BootstrapHostBuilder.cs#L12
export class BootstrapHostBuilder implements IHostBuilder {
	private readonly configureServicesActions: ((
		/* TODO */ services: IServiceCollection,
	) => void)[] = [];

	constructor(private readonly builder: HostAppBuilder) {}

	// https://github.com/dotnet/aspnetcore/blob/313ee06a672385ede5d2c9a01d31a7d9d35a6340/src/DefaultBuilder/src/BootstrapHostBuilder.cs#L55
	configureServices = (
		configureDelegate: (
			// TODO: context: HostBuilderContext,
			services: IServiceCollection,
		) => void,
	): this => {
		this.configureServicesActions.push(configureDelegate);
		return this;
	};

	// https://github.com/dotnet/aspnetcore/blob/313ee06a672385ede5d2c9a01d31a7d9d35a6340/src/DefaultBuilder/src/BootstrapHostBuilder.cs#L85
	runDefaultCallbacks = (): void /* TODO: ServiceDescriptor */ => {
		for (const configureServicesAction of this.configureServicesActions) {
			configureServicesAction(/* TODO */ this.builder.services);
		}
	};
}
