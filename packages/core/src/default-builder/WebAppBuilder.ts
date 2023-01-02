import { BootstrapHostBuilder } from '@yohira/core/default-builder/BootstrapHostBuilder';
import { configureWebHostDefaults } from '@yohira/core/default-builder/GenericHostBuilderExtensions';
import { WebApp } from '@yohira/core/default-builder/WebApp';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { HostAppBuilder } from '@yohira/extensions.hosting/HostAppBuilder';
import { configure } from '@yohira/hosting/WebHostBuilderExtensions';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { run } from '@yohira/http.abstractions/extensions/RunExtensions';

// https://source.dot.net/#Microsoft.AspNetCore/WebApplicationBuilder.cs,25a352b50e81d95b,references
export class WebAppBuilder {
	private readonly hostAppBuilder: HostAppBuilder;

	private builtApp?: WebApp;

	private configureApp = (
		/* TODO: context: WebHostBuilderContext, */
		app: IAppBuilder,
	): void => {
		const { builtApp } = this;
		if (builtApp === undefined) {
			throw new Error('Assertion failed.');
		}

		// TODO

		app.use((next) => {
			run(builtApp, next);
			return builtApp.build();
		});

		// TODO
	};

	constructor() {
		// TODO

		this.hostAppBuilder = new HostAppBuilder(/* TODO */);

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

	build = (): WebApp => {
		// TODO
		this.builtApp = new WebApp(this.hostAppBuilder.build());
		return this.builtApp;
	};
}
