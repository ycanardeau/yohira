import { HostAppBuilder } from '@/hosting/HostAppBuilder';
import { IHostBuilder } from '@/hosting/IHostBuilder';

// https://github.com/dotnet/aspnetcore/blob/313ee06a672385ede5d2c9a01d31a7d9d35a6340/src/DefaultBuilder/src/BootstrapHostBuilder.cs#L12
export class BootstrapHostBuilder implements IHostBuilder {
	constructor(private readonly builder: HostAppBuilder) {}

	configureServices = (/* TODO */): this => {
		// IMPL
		return this;
	};
}
