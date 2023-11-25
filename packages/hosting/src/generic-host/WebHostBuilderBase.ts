import {
	ConfigBuilder,
	addInMemoryCollection,
} from '@yohira/extensions.config';
import { IConfig } from '@yohira/extensions.config.abstractions';
import { addEnvVariables } from '@yohira/extensions.config.env-variables';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';
import {
	HostBuilderContext,
	IHostBuilder,
} from '@yohira/extensions.hosting.abstractions';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';

import { WebHostBuilderContext } from '../WebHostBuilderContext';
import { WebHostBuilderOptions } from '../WebHostBuilderOptions';
import { HostingEnv } from '../internal/HostingEnv';
import { initialize } from '../internal/HostingEnvExtensions';
import { WebHostOptions } from '../internal/WebHostOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/GenericHost/WebHostBuilderBase.cs,403338cb733d8342
export abstract class WebHostBuilderBase implements IWebHostBuilder {
	/* TODO: , ISupportsUseDefaultServiceProvider */

	protected readonly config: IConfig;

	constructor(
		protected readonly builder: IHostBuilder,
		options: WebHostBuilderOptions,
	) {
		const configBuilder = addInMemoryCollection(new ConfigBuilder());

		if (!options.suppressEnvConfig) {
			addEnvVariables(configBuilder, 'yohira_');
		}

		this.config = configBuilder.buildSync();
	}

	protected getWebHostBuilderContext(
		context: HostBuilderContext,
	): WebHostBuilderContext {
		if (true /* TODO */) {
			// Use _config as a fallback for WebHostOptions in case the chained source was removed from the hosting IConfigurationBuilder.
			const options = new WebHostOptions(context.config);
			const webHostBuilderContext = ((): WebHostBuilderContext => {
				const webHostBuilderContext =
					new WebHostBuilderContext(/* TODO */);
				// TODO
				webHostBuilderContext.hostingEnv = new HostingEnv();
				return webHostBuilderContext;
			})();
			initialize(
				webHostBuilderContext.hostingEnv,
				context.hostingEnv.contentRootPath,
				options,
				context.hostingEnv,
			);
			// TODO
			return webHostBuilderContext;
		}

		// TODO
		throw new Error('Method not implemented.');
	}

	configureServices(
		configureServices: (
			context: WebHostBuilderContext,
			services: IServiceCollection,
		) => void,
	): this {
		this.builder.configureServices((context, builder) => {
			const webhostBuilderContext =
				this.getWebHostBuilderContext(context);
			configureServices(webhostBuilderContext, builder);
		});

		return this;
	}

	getSetting(key: string): string | undefined {
		return this.config.get(key);
	}

	useSetting(key: string, value: string | undefined): this {
		this.config.set(key, value);
		return this;
	}
}
