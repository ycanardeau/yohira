import { configureWebDefaults } from '@/WebHost';
import { IServiceCollection } from '@/dependency-injection/ServiceCollection';
import { singleton } from '@/dependency-injection/ServiceDescriptor';
import { BootstrapHostBuilder } from '@/hosting/BootstrapHostBuilder';
import { GenericWebHostBuilder } from '@/hosting/GenericWebHostBuilder';
import { GenericWebHostService } from '@/hosting/GenericWebHostService';
import { HostAppBuilder } from '@/hosting/HostAppBuilder';
import { IHost, runHost } from '@/hosting/IHost';
import { IHostBuilder } from '@/hosting/IHostBuilder';
import { IHostedService } from '@/hosting/IHostedService';
import { IWebHostBuilder } from '@/hosting/IWebHostBuilder';
import { WebHostBuilderOptions } from '@/hosting/WebHostBuilderOptions';
import { TYPES } from '@/types';

// https://github.com/dotnet/aspnetcore/blob/39f0e0b8f40b4754418f81aef0de58a9204a1fe5/src/DefaultBuilder/src/WebApplication.cs#L21
class WebApp implements IHost {
	constructor(private readonly host: IHost) {}

	// https://github.com/dotnet/aspnetcore/blob/39f0e0b8f40b4754418f81aef0de58a9204a1fe5/src/DefaultBuilder/src/WebApplication.cs#L125
	start = (): Promise<void> => {
		return this.host.start();
	};

	// https://github.com/dotnet/aspnetcore/blob/39f0e0b8f40b4754418f81aef0de58a9204a1fe5/src/DefaultBuilder/src/WebApplication.cs#L197
	private listen = (): void => {
		// IMPL
	};

	// https://github.com/dotnet/aspnetcore/blob/39f0e0b8f40b4754418f81aef0de58a9204a1fe5/src/DefaultBuilder/src/WebApplication.cs#L146
	run = (): Promise<void> => {
		this.listen();
		return runHost(this);
	};
}

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/ServiceCollectionHostedServiceExtensions.cs#L22
const addHostedService = <THostedService extends IHostedService>(
	services: IServiceCollection,
	implementation: new (...args: never[]) => THostedService,
): IServiceCollection => {
	services.push(singleton(TYPES.IHostedService, undefined, implementation));
	return services;
};

// https://github.com/dotnet/aspnetcore/blob/c85baf8db0c72ae8e68643029d514b2e737c9fae/src/Hosting/Hosting/src/GenericHostWebHostBuilderExtensions.cs#L38
const configureWebHost = (
	builder: IHostBuilder,
	configure: (webHostBuilder: IWebHostBuilder) => void,
	configureWebHostBuilder: (options: WebHostBuilderOptions) => void,
): IHostBuilder => {
	const webHostBuilderOptions = new WebHostBuilderOptions();
	configureWebHostBuilder(webHostBuilderOptions);
	const webHostBuilder = new GenericWebHostBuilder(
		builder,
		webHostBuilderOptions,
	);
	configure(webHostBuilder);
	builder.configureServices((/* TODO: _, */ services) =>
		addHostedService<GenericWebHostService>(
			services,
			GenericWebHostService,
		),
	);
	return builder;
};

// https://github.com/dotnet/aspnetcore/blob/313ee06a672385ede5d2c9a01d31a7d9d35a6340/src/DefaultBuilder/src/GenericHostBuilderExtensions.cs#L61
const configureWebHostDefaults = (
	builder: IHostBuilder,
	configure: (webHostBuilder: IWebHostBuilder) => void,
	configureOptions: (options: WebHostBuilderOptions) => void,
): IHostBuilder => {
	return configureWebHost(
		builder,
		(webHostBuilder) => {
			configureWebDefaults(webHostBuilder);

			configure(webHostBuilder);
		},
		configureOptions,
	);
};

// https://github.com/dotnet/aspnetcore/blob/14c39984660a8cefb09a8d77331b47ffc48d7a22/src/DefaultBuilder/src/WebApplicationBuilder.cs#L18
class WebAppBuilder {
	private readonly hostAppBuilder: HostAppBuilder;

	constructor() {
		this.hostAppBuilder = new HostAppBuilder(/* TODO */);

		const bootstrapHostBuilder = new BootstrapHostBuilder(
			this.hostAppBuilder,
		);

		configureWebHostDefaults(
			bootstrapHostBuilder,
			(webHostBuilder) => {
				// IMPL
			},
			(options) => {
				// IMPL
			},
		);

		/* TODO */ bootstrapHostBuilder.runDefaultCallbacks();
	}

	// https://github.com/dotnet/aspnetcore/blob/14c39984660a8cefb09a8d77331b47ffc48d7a22/src/DefaultBuilder/src/WebApplicationBuilder.cs#L125
	build = (): WebApp => {
		return new WebApp(this.hostAppBuilder.build());
	};
}

export const createWebAppBuilder = (): WebAppBuilder => {
	return new WebAppBuilder();
};
