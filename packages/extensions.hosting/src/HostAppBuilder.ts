import { IServiceProvider } from '@yohira/base';
import {
	ConfigManager,
	addInMemoryCollection,
} from '@yohira/extensions.config';
import {
	ServiceProviderOptions,
	buildServiceProvider,
} from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	HostBuilderContext,
	HostDefaults,
	IHost,
	IHostEnv,
} from '@yohira/extensions.hosting.abstractions';

import { HostAppBuilderSettings } from './HostAppBuilderSettings';
import {
	createHostingEnv,
	populateServiceCollection,
	resolveHost,
} from './HostBuilder';
import {
	applyDefaultAppConfig,
	createDefaultServiceProviderOptions,
} from './HostingHostBuilderExtensions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostApplicationBuilder.cs,c659330adb7f1ad0,references
export class HostAppBuilder {
	private readonly hostBuilderContext: HostBuilderContext;
	private readonly serviceCollection = new ServiceCollection();

	private createServiceProvider: () => IServiceProvider;

	private hostBuilt = false;
	private appServices: IServiceProvider | undefined;

	/**
	 * Provides information about the hosting environment an application is running in.
	 */
	readonly env: IHostEnv;

	/**
	 * A collection of services for the application to compose. This is useful for adding user provided or framework provided services.
	 */
	readonly config: ConfigManager;

	constructor(settings: HostAppBuilderSettings | undefined) {
		settings ??= new HostAppBuilderSettings();
		this.config = settings.config ?? new ConfigManager();

		// TODO

		// HostApplicationBuilderSettings override all other config sources.
		let optionList: [string, string | undefined][] | undefined = undefined;
		if (settings.appName !== undefined) {
			optionList ??= [];
			optionList.push([HostDefaults.AppKey, settings.appName]);
		}
		if (settings.envName !== undefined) {
			optionList ??= [];
			optionList.push([HostDefaults.EnvKey, settings.envName]);
		}
		if (settings.contentRootPath !== undefined) {
			optionList ??= [];
			optionList.push([
				HostDefaults.ContentRootKey,
				settings.contentRootPath,
			]);
		}
		if (optionList !== undefined) {
			addInMemoryCollection(this.config, Object.fromEntries(optionList));
		}

		const { hostingEnv } = createHostingEnv(this.config);

		// TODO: this.config.setFileProvider(physicalFileProvider);

		// TODO

		this.hostBuilderContext = new HostBuilderContext(new Map());
		this.hostBuilderContext.hostingEnv = hostingEnv;
		this.hostBuilderContext.config = this.config;

		this.env = hostingEnv;

		populateServiceCollection(
			this.services,
			this.hostBuilderContext,
			this.config,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			() => this.appServices!,
		);

		// TODO

		let serviceProviderOptions: ServiceProviderOptions | undefined =
			undefined;

		if (!settings.disableDefaults) {
			applyDefaultAppConfig(
				this.hostBuilderContext,
				this.config,
				settings.args,
			);
			// TODO
			serviceProviderOptions = createDefaultServiceProviderOptions(
				this.hostBuilderContext,
			);
		}

		this.createServiceProvider = (): IServiceProvider => {
			// TODO
			return buildServiceProvider(this.services, serviceProviderOptions);
		};
	}

	get services(): IServiceCollection {
		return this.serviceCollection;
	}

	build(): IHost {
		if (this.hostBuilt) {
			throw new Error('Build can only be called once.' /* LOC */);
		}
		this.hostBuilt = true;

		// TODO

		this.appServices = this.createServiceProvider();

		this.serviceCollection.makeReadonly();

		return resolveHost(this.appServices /* TODO */);
	}
}
