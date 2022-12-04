import { IConnectionListenerFactory } from '@/connections/IConnectionListener';
import { IServiceCollection } from '@/dependency-injection/ServiceCollection';
import { ServiceLifetime } from '@/dependency-injection/ServiceDescriptor';
import { IServer } from '@/hosting/IServer';
import { IWebHostBuilder } from '@/hosting/IWebHostBuilder';
import { AddressBindContext } from '@/server/AddressBindContext';
import { useHttpServer } from '@/server/HttpConnectionMiddleware';
import { ListenOptions } from '@/server/ListenOptions';
import { SocketTransportFactory } from '@/server/SocketTransportFactory';
import { TransportManager } from '@/server/TransportManager';
import { TYPES } from '@/types';
import { inject, injectable, multiInject } from 'inversify';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/AddressBinder.cs#L99
const parseAddress = (/* TODO */): ListenOptions => {
	return new ListenOptions({
		/* TODO */
	}); /* TODO */
};

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/AddressBinder.cs#L141
interface IStrategy {
	bind(context: AddressBindContext): Promise<void>;
}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/AddressBinder.cs#L146
class DefaultAddressStrategy implements IStrategy {
	bind = async (context: AddressBindContext): Promise<void> => {
		const httpDefault = parseAddress(/* TODO */);
		// TODO
		await httpDefault.bind(context);

		// TODO: context.logger.logDebug(CoreStrings.BindingToDefaultAddress, Constants.DefaultServerAddress);
	};
}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/AddressBinder.cs#L34
const createStrategy = (): IStrategy => {
	return new DefaultAddressStrategy /* TODO */();
};

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/AddressBinder.cs#L19
const bindAddress = async (
	/* TODO */ context: AddressBindContext,
): Promise<void> => {
	const strategy = createStrategy(/* TODO */);

	// TODO

	await strategy.bind(context);
};

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/KestrelServerOptions.cs#L26
export class KestrelServerOptions {}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/KestrelServerImpl.cs#L21
@injectable()
export class KestrelServerImpl implements IServer {
	private readonly transportManager: TransportManager;
	private readonly transportFactories: IConnectionListenerFactory[];

	private addressBindContext?: AddressBindContext;

	constructor(
		@multiInject(TYPES.IConnectionListenerFactory)
		transportFactories: IConnectionListenerFactory[],
	) {
		this.transportFactories = Array.from(transportFactories).reverse();

		this.transportManager = new TransportManager(
			this.transportFactories /* TODO */,
		);
	}

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/KestrelServerImpl.cs#L402
	private validateOptions = (): void => {
		// IMPL
	};

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/KestrelServerImpl.cs#L291
	private bind = async (): Promise<void> => {
		// TODO

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		await bindAddress(/* TODO */ this.addressBindContext!);

		// TODO
	};

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/KestrelServerImpl.cs#L140
	start = async (): Promise<void> => {
		try {
			this.validateOptions();

			// TODO

			const onBind = async (
				options: ListenOptions /* TODO */,
			): Promise<void> => {
				if (true /* TODO */) {
					// TODO

					useHttpServer(options /* TODO */);
					const connectionDelegate = options.build();

					// TODO

					options.endPoint = await this.transportManager.bind(
						/* TODO */
						connectionDelegate,
						/* TODO */
					);
				}
			};

			this.addressBindContext = new AddressBindContext(/* TODO */ onBind);

			await this.bind();
		} catch (error) {
			// TODO: this.dispose();
			throw error;
		}
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
		addSingleton(
			/* TODO: tryAddSingleton */ services,
			TYPES.IConnectionListenerFactory,
			undefined,
			SocketTransportFactory,
		);

		// TODO
		addSingleton(services, TYPES.IServer, undefined, KestrelServerImpl);
	});

	return configureKestrel(hostBuilder, configureOptions);
};
