import { IServiceProvider } from '@yohira/base';
import {
	ConfigBuilder,
	addInMemoryCollection,
} from '@yohira/extensions.config';
import { IConfig } from '@yohira/extensions.config.abstractions';
import { DefaultServiceProviderFactory } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
	addSingletonFactory,
	addSingletonInstance,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	Envs,
	HostBuilderContext,
	HostDefaults,
	IHost,
	IHostBuilder,
} from '@yohira/extensions.hosting.abstractions';
import { addLogging } from '@yohira/extensions.logging';
import { ILoggerT } from '@yohira/extensions.logging.abstractions';
import { HostingEnv } from '@yohira/hosting';

import { Host } from './internal/Host';
import { IServiceFactoryAdapter } from './internal/IServiceFactoryAdapter';
import { ServiceFactoryAdapter } from './internal/ServiceFactoryAdapter';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,afe23a39fda43335,references
/** @internal */ export function createHostingEnv(hostConfig: IConfig): {
	hostingEnv: HostingEnv;
} {
	const hostingEnv = new HostingEnv();
	hostingEnv.envName = hostConfig.get(HostDefaults.EnvKey) ?? Envs.Production;
	hostingEnv.contentRootPath = ''; /* TODO */

	// TODO

	return { hostingEnv: hostingEnv };
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,a8c4578a1465d84d,references
/** @internal */ export function populateServiceCollection(
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
/** @internal */ export function resolveHost(
	serviceProvider: IServiceProvider /* TODO */,
): IHost {
	// TODO

	const host = getRequiredService<IHost>(serviceProvider, IHost);

	// TODO

	return host;
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,c901d0d870118921,references
export class HostBuilder implements IHostBuilder {
	private configureServicesActions: ((
		context: HostBuilderContext,
		services: IServiceCollection,
	) => void)[] = [];
	private serviceProviderFactory: IServiceFactoryAdapter;
	private hostBuilt = false;
	private hostConfig: IConfig | undefined;
	private hostBuilderContext: HostBuilderContext | undefined;
	private hostingEnv: HostingEnv | undefined;
	private appServices: IServiceProvider | undefined;

	constructor() {
		this.serviceProviderFactory =
			new ServiceFactoryAdapter<IServiceCollection>(
				new DefaultServiceProviderFactory(),
			);
	}

	configureServices(
		configureDelegate: (
			context: HostBuilderContext,
			services: IServiceCollection,
		) => void,
	): this {
		this.configureServicesActions.push(configureDelegate);
		return this;
	}

	private initializeHostConfig(): void {
		const configBuilder = new ConfigBuilder();
		addInMemoryCollection(configBuilder);

		/* TODO: for (const buildAction of this.configureHostConfigActions) {
			buildAction(configBuilder);
		} */
		this.hostConfig = configBuilder.buildSync();
	}

	private initializeHostingEnv(): void {
		const { hostingEnv /* TODO: , defaultProvider */ } = createHostingEnv(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.hostConfig!,
		);
		this.hostingEnv = hostingEnv;
		// TODO: this.defaultProvider = defaultProvider;
	}

	private initializeHostBuilderContext(): void {
		this.hostBuilderContext = new HostBuilderContext();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.hostBuilderContext.hostingEnv = this.hostingEnv!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.hostBuilderContext.config = this.hostConfig!;
	}

	private initializeServiceProvider(): void {
		const services = new ServiceCollection();

		populateServiceCollection(
			services,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.hostBuilderContext!,
			// TODO
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			() => this.appServices!,
		);

		for (const configureServicesAction of this.configureServicesActions) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			configureServicesAction(this.hostBuilderContext!, services);
		}

		const containerBuilder =
			this.serviceProviderFactory.createBuilder(services);

		// TODO

		this.appServices =
			this.serviceProviderFactory.createServiceProvider(containerBuilder);
	}

	build(): IHost {
		if (this.hostBuilt) {
			throw new Error('Build can only be called once.' /* LOC */);
		}
		this.hostBuilt = true;

		// TODO

		this.initializeHostConfig();
		this.initializeHostingEnv();
		this.initializeHostBuilderContext();
		// TODO: initializeAppConfig();
		this.initializeServiceProvider();

		return resolveHost(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.appServices!,
			/* TODO: diagnosticListener */
		);
	}
}
