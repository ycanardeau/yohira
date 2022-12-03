import { IServiceCollection } from '@/dependency-injection/ServiceCollection';
import { ServiceLifetime } from '@/dependency-injection/ServiceDescriptor';
import { IServer } from '@/hosting/IServer';
import { IWebHostBuilder } from '@/hosting/IWebHostBuilder';
import { TYPES } from '@/types';
import { injectable } from 'inversify';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/KestrelServerOptions.cs#L26
export class KestrelServerOptions {}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/KestrelServerImpl.cs#L21
@injectable()
export class KestrelServerImpl implements IServer {
	start = async (): Promise<void> => {
		// TODO
	};
}

// https://github.com/dotnet/runtime/blob/b77aa8a9726503df52327a0388a3f4a0325989e1/src/libraries/Microsoft.Extensions.DependencyInjection.Abstractions/src/ServiceCollectionServiceExtensions.cs#L485
const add = (
	services: IServiceCollection,
	serviceType: symbol,
	T: string | undefined,
	implementationType: new (...args: never[]) => unknown,
	lifetime: ServiceLifetime,
): IServiceCollection => {
	const descriptor = {
		serviceType,
		T,
		implementationType,
		lifetime,
	};
	services.push(descriptor);
	return services;
};

// https://github.com/dotnet/runtime/blob/b77aa8a9726503df52327a0388a3f4a0325989e1/src/libraries/Microsoft.Extensions.DependencyInjection.Abstractions/src/ServiceCollectionServiceExtensions.cs#L309
const addSingleton = (
	services: IServiceCollection,
	serviceType: symbol,
	T: string | undefined,
	implementationType: new (...args: never[]) => unknown,
): IServiceCollection => {
	return add(
		services,
		serviceType,
		T,
		implementationType,
		ServiceLifetime.Singleton,
	);
};

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Kestrel/src/WebHostBuilderKestrelExtensions.cs#L113
const configureKestrel = (
	hostBuilder: IWebHostBuilder,
	configureOptions: (
		/* TODO: context */ options: KestrelServerOptions,
	) => void,
): IWebHostBuilder => {
	return hostBuilder; /* TODO */
};

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Kestrel/src/WebHostBuilderKestrelExtensions.cs#L30
export const useKestrel = (
	hostBuilder: IWebHostBuilder,
	configureOptions: (
		/* TODO: context */ options: KestrelServerOptions,
	) => void,
): IWebHostBuilder => {
	// TODO

	hostBuilder.configureServices((services) => {
		addSingleton(services, TYPES.IServer, undefined, KestrelServerImpl);
	});

	return configureKestrel(hostBuilder, configureOptions);
};
