import { IServiceProvider } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	HostBuilderContext,
	IHost,
} from '@yohira/extensions.hosting.abstractions';

import {
	createHostingEnv,
	populateServiceCollection,
	resolveHost,
} from './HostBuilder';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostApplicationBuilder.cs,c659330adb7f1ad0,references
export class HostAppBuilder {
	private readonly hostBuilderContext: HostBuilderContext;
	private readonly serviceCollection = new ServiceCollection();

	private createServiceProvider: () => IServiceProvider;

	private hostBuilt = false;
	private appServices?: IServiceProvider;

	constructor() {
		// TODO

		const { hostingEnv } = createHostingEnv(/* TODO */);

		// TODO

		this.hostBuilderContext = new HostBuilderContext(/* TODO */);
		this.hostBuilderContext.hostingEnv = hostingEnv;
		// TODO

		// TODO

		populateServiceCollection(
			this.services,
			this.hostBuilderContext,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			() => this.appServices!,
		);

		// TODO

		this.createServiceProvider = (): IServiceProvider => {
			// TODO
			return buildServiceProvider(this.services);
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
