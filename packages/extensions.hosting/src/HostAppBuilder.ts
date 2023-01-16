import { populateServiceCollection, resolveHost } from '@/HostBuilder';
import { IServiceProvider } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
} from '@yohira/extensions.dependency-injection.abstractions';
import { IHost } from '@yohira/extensions.hosting.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/HostApplicationBuilder.cs,c659330adb7f1ad0,references
export class HostAppBuilder {
	private readonly serviceCollection = new ServiceCollection();

	private createServiceProvider: () => IServiceProvider;

	private hostBuilt = false;
	private appServices?: IServiceProvider;

	constructor() {
		// TODO

		populateServiceCollection(
			this.services,
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
