import { ConfigManager } from '@yohira/extensions.config';
import { addEnvVariables } from '@yohira/extensions.config.env-variables';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';
import {
	HostAppBuilder,
	HostAppBuilderSettings,
} from '@yohira/extensions.hosting';
import { configure } from '@yohira/hosting';
import { IAppBuilder, addTerminalMiddleware } from '@yohira/http.abstractions';

import { BootstrapHostBuilder } from './BootstrapHostBuilder';
import { configureWebHostDefaults } from './GenericHostBuilderExtensions';
import { WebApp } from './WebApp';
import { WebAppOptions } from './WebAppOptions';

// https://source.dot.net/#Microsoft.AspNetCore/WebApplicationBuilder.cs,25a352b50e81d95b,references
export class WebAppBuilder {
	private readonly hostAppBuilder: HostAppBuilder;

	private builtApp: WebApp | undefined;

	private configureApp = (
		/* TODO: context: WebHostBuilderContext, */
		app: IAppBuilder,
	): void => {
		const builtApp = this.builtApp;
		if (builtApp === undefined) {
			throw new Error('Assertion failed.');
		}

		// TODO

		app.use((next) => {
			addTerminalMiddleware(builtApp, next);
			return builtApp.build();
		});

		// TODO
	};

	constructor(options: WebAppOptions) {
		const config = new ConfigManager();

		addEnvVariables(config, 'YOHIRA_');

		const hostAppBuilderSettings = new HostAppBuilderSettings();
		hostAppBuilderSettings.args = options.args;
		hostAppBuilderSettings.appName = options.appName;
		hostAppBuilderSettings.envName = options.envName;
		hostAppBuilderSettings.contentRootPath = options.contentRootPath;
		hostAppBuilderSettings.config = config;
		this.hostAppBuilder = new HostAppBuilder(hostAppBuilderSettings);

		const bootstrapHostBuilder = new BootstrapHostBuilder(
			this.hostAppBuilder,
		);

		// TODO

		configureWebHostDefaults(bootstrapHostBuilder, (webHostBuilder) => {
			configure(webHostBuilder, this.configureApp);
		});

		/* TODO: this.genericWebHostServiceDescriptor = */ bootstrapHostBuilder.runDefaultCallbacks();

		// TODO
	}

	get services(): IServiceCollection {
		return this.hostAppBuilder.services;
	}

	build(): WebApp {
		// TODO
		this.builtApp = new WebApp(this.hostAppBuilder.build());
		return this.builtApp;
	}
}
