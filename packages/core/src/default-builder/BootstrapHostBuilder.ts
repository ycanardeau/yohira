import { IHostBuilder } from '@yohira/hosting.abstractions/IHostBuilder';
import { HostAppBuilder } from '@yohira/hosting/HostAppBuilder';

// https://source.dot.net/#Microsoft.AspNetCore/BootstrapHostBuilder.cs,9f38532326a07c2d,references
export class BootstrapHostBuilder implements IHostBuilder {
	private readonly configureServicesActions: ((/* TODO */) => void)[] = [];

	constructor(private readonly builder: HostAppBuilder) {}

	configureServices = (configureDelegate: (/* TODO */) => void): this => {
		this.configureServicesActions.push(configureDelegate);
		return this;
	};

	runDefaultCallbacks = (): void /* TODO: ServiceDescriptor */ => {
		// TODO

		for (const configureServicesAction of this.configureServicesActions) {
			configureServicesAction(/* TODO */);
		}

		// TODO
	};
}
