import { BootstrapHostBuilder } from '@yohira/core/default-builder/BootstrapHostBuilder';
import { configureWebHostDefaults } from '@yohira/core/default-builder/GenericHostBuilderExtensions';
import { WebApp } from '@yohira/core/default-builder/WebApp';
import { HostAppBuilder } from '@yohira/hosting/HostAppBuilder';
import { configure } from '@yohira/hosting/WebHostBuilderExtensions';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';

// https://source.dot.net/#Microsoft.AspNetCore/WebApplicationBuilder.cs,25a352b50e81d95b,references
export class WebAppBuilder {
	private readonly hostAppBuilder: HostAppBuilder;

	private builtApp?: WebApp;

	private configureApp = (
		/* TODO: context: WebHostBuilderContext, */
		app: IAppBuilder,
	): void => {
		// TODO
		throw new Error('Method not implemented.');
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

	build = (): WebApp => {
		// TODO
		this.builtApp = new WebApp(this.hostAppBuilder.build());
		return this.builtApp;
	};
}
