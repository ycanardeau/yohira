import { BootstrapHostBuilder } from '@/default-builder/BootstrapHostBuilder';
import { configureWebHostDefaults } from '@/default-builder/GenericHostBuilderExtensions';
import { WebApp } from '@/default-builder/WebApp';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';
import { HostAppBuilder } from '@yohira/extensions.hosting';
import { configure } from '@yohira/hosting';
import { IAppBuilder, run } from '@yohira/http.abstractions';

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

	build(): WebApp {
		// TODO
		this.builtApp = new WebApp(this.hostAppBuilder.build());
		return this.builtApp;
	}
}
