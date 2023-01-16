import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';
import { HostAppBuilder } from '@yohira/extensions.hosting';
import { IHostBuilder } from '@yohira/extensions.hosting.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore/BootstrapHostBuilder.cs,9f38532326a07c2d,references
export class BootstrapHostBuilder implements IHostBuilder {
	private readonly configureServicesActions: ((
		/* TODO */ services: IServiceCollection,
	) => void)[] = [];

	constructor(private readonly builder: HostAppBuilder) {}

	configureServices(
		configureDelegate: (/* TODO */ services: IServiceCollection) => void,
	): this {
		this.configureServicesActions.push(configureDelegate);
		return this;
	}

	runDefaultCallbacks(): void /* TODO: ServiceDescriptor */ {
		// TODO

		for (const configureServicesAction of this.configureServicesActions) {
			configureServicesAction(/* TODO */ this.builder.services);
		}

		// TODO
	}
}
