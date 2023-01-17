import { Type } from '@yohira/base';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';
import { HostAppBuilder } from '@yohira/extensions.hosting';
import {
	HostBuilderContext,
	IHostBuilder,
} from '@yohira/extensions.hosting.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore/BootstrapHostBuilder.cs,9f38532326a07c2d,references
export class BootstrapHostBuilder implements IHostBuilder {
	private readonly configureServicesActions: ((
		context: HostBuilderContext,
		services: IServiceCollection,
	) => void)[] = [];

	readonly context: HostBuilderContext;

	constructor(private readonly builder: HostAppBuilder) {
		let context: HostBuilderContext | undefined;
		for (const descriptor of builder.services) {
			if (
				descriptor.serviceType.equals(Type.from('HostBuilderContext'))
			) {
				context = descriptor.implInstance as HostBuilderContext;
				break;
			}
		}

		if (context === undefined) {
			throw new Error(
				'HostBuilderContext must exist in the IServiceCollection',
			);
		}
		this.context = context;
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

	runDefaultCallbacks(): void /* TODO: ServiceDescriptor */ {
		// TODO

		for (const configureServicesAction of this.configureServicesActions) {
			configureServicesAction(this.context, this.builder.services);
		}

		// TODO
	}
}
