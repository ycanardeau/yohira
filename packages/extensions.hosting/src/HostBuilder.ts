import {
	IServiceProvider,
	combinePaths,
	getFullPath,
	isPathRooted,
} from '@yohira/base';
import {
	ConfigBuilder,
	addConfig,
	addInMemoryCollection,
} from '@yohira/extensions.config';
import {
	IConfig,
	IConfigBuilder,
} from '@yohira/extensions.config.abstractions';
import { setBasePath } from '@yohira/extensions.config.file-extensions';
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
import { cwd } from 'node:process';

import { Host } from './internal/Host';
import { IServiceFactoryAdapter } from './internal/IServiceFactoryAdapter';
import { ServiceFactoryAdapter } from './internal/ServiceFactoryAdapter';

function resolveContentRootPath(
	contentRootPath: string | undefined,
	basePath: string,
): string {
	if (!contentRootPath) {
		return basePath;
	}
	if (isPathRooted(contentRootPath)) {
		return contentRootPath;
	}
	return combinePaths(getFullPath(basePath), contentRootPath);
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,afe23a39fda43335,references
/** @internal */ export function createHostingEnv(hostConfig: IConfig): {
	hostingEnv: HostingEnv;
} {
	const hostingEnv = new HostingEnv();
	hostingEnv.envName = hostConfig.get(HostDefaults.EnvKey) ?? Envs.Production;
	hostingEnv.contentRootPath = resolveContentRootPath(
		hostConfig.get(HostDefaults.ContentRootKey),
		cwd() /* REVIEW */,
	);

	// TODO

	return { hostingEnv: hostingEnv };
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostBuilder.cs,a8c4578a1465d84d,references
/** @internal */ export function populateServiceCollection(
	services: IServiceCollection,
	hostBuilderContext: HostBuilderContext,
	appConfig: IConfig,
	serviceProviderGetter: () => IServiceProvider,
): void {
	// TODO
	addSingletonInstance(
		services,
		Symbol.for('HostBuilderContext'),
		hostBuilderContext,
	);
	// register configuration as factory to make it dispose with the service provider
	addSingletonFactory(services, IConfig, () => appConfig);
	// TODO

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
	private readonly configureHostConfigActions: ((
		config: IConfigBuilder,
	) => void)[] = [];
	private readonly configureAppConfigActions: ((
		context: HostBuilderContext,
		configBuilder: IConfigBuilder,
	) => void)[] = [];
	private readonly configureServicesActions: ((
		context: HostBuilderContext,
		services: IServiceCollection,
	) => void)[] = [];
	private serviceProviderFactory: IServiceFactoryAdapter;
	private hostBuilt = false;
	private hostConfig: IConfig | undefined;
	private appConfig: IConfig | undefined;
	private hostBuilderContext: HostBuilderContext | undefined;
	private hostingEnv: HostingEnv | undefined;
	private appServices: IServiceProvider | undefined;

	/**
	 * A central location for sharing state between components during the host building process.
	 */
	readonly properties = new Map<keyof any, object /* TODO */>();

	constructor() {
		this.serviceProviderFactory =
			new ServiceFactoryAdapter<IServiceCollection>(
				new DefaultServiceProviderFactory(),
			);
	}

	configureHostConfig(
		configureDelegate: (config: IConfigBuilder) => void,
	): this {
		this.configureHostConfigActions.push(configureDelegate);
		return this;
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
		addInMemoryCollection(configBuilder); // Make sure there's some default storage since there are no default providers

		for (const buildAction of this.configureHostConfigActions) {
			buildAction(configBuilder);
		}
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
		this.hostBuilderContext = new HostBuilderContext(this.properties);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.hostBuilderContext.hostingEnv = this.hostingEnv!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.hostBuilderContext.config = this.hostConfig!;
	}

	private initializeAppConfig(): void {
		let $: IConfigBuilder = new ConfigBuilder();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		$ = setBasePath($, this.hostingEnv!.contentRootPath);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const configBuilder = addConfig($, this.hostConfig!, true);

		for (const buildAction of this.configureAppConfigActions) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			buildAction(this.hostBuilderContext!, configBuilder);
		}
		this.appConfig = configBuilder.buildSync();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.hostBuilderContext!.config = this.appConfig;
	}

	private initializeServiceProvider(): void {
		const services = new ServiceCollection();

		populateServiceCollection(
			services,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.hostBuilderContext!,
			// TODO
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.appConfig!,
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
		this.initializeAppConfig();
		this.initializeServiceProvider();

		return resolveHost(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.appServices!,
			/* TODO: diagnosticListener */
		);
	}
}
