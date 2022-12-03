import { IServiceCollection } from '@/dependency-injection/ServiceCollection';
import {
	ServiceLifetime,
	singleton,
} from '@/dependency-injection/ServiceDescriptor';
import { GenericWebHostServiceOptions } from '@/hosting/GenericWebHostService';
import { IHostBuilder } from '@/hosting/IHostBuilder';
import { WebHostBuilderOptions } from '@/hosting/WebHostBuilderOptions';
import { ConfigureNamedOptions } from '@/options/ConfigureNamedOptions';
import { UnnamedOptionsManager } from '@/options/UnnamedOptionsManager';
import { TYPES } from '@/types';

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.Options/src/OptionsServiceCollectionExtensions.cs#L22
const addOptions = (services: IServiceCollection): IServiceCollection => {
	services.push(singleton(TYPES.IOptions, undefined, UnnamedOptionsManager));
	// IMPL
	return services;
};

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.DependencyInjection.Abstractions/src/ServiceCollectionServiceExtensions.cs#L451
const addSingleton = (
	services: IServiceCollection,
	serviceType: symbol,
	T: string,
	implementationInstance: object /* TODO */,
): IServiceCollection => {
	const serviceDescriptor = {
		serviceType,
		T,
		implementationInstance,
		lifetime: ServiceLifetime.Singleton,
	};
	services.push(serviceDescriptor);
	return services;
};

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.Options/src/OptionsServiceCollectionExtensions.cs#L54
const configure = <TOptions>(
	services: IServiceCollection,
	TOptions: string,
	name: string | undefined,
	configureOptions: (options: TOptions) => void,
): IServiceCollection => {
	addOptions(services);
	addSingleton(
		services,
		TYPES.IConfigureOptions,
		TOptions,
		new ConfigureNamedOptions<TOptions>(TOptions, name, configureOptions),
	);
	return services;
};

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.Options/src/Options.cs#L19
const defaultName = '';

// https://github.com/dotnet/aspnetcore/blob/600eb9aa53c052ec7327e2399744215dbe493a89/src/Hosting/Hosting/src/GenericHost/GenericWebHostBuilder.cs#L20
export class GenericWebHostBuilder {
	constructor(
		private readonly builder: IHostBuilder,
		options: WebHostBuilderOptions,
	) {
		builder.configureServices((/* TODO */ services) => {
			configure<GenericWebHostServiceOptions>(
				services,
				'GenericWebHostServiceOptions',
				defaultName,
				(options) => {
					// IMPL
				},
			);
		});
	}
}
