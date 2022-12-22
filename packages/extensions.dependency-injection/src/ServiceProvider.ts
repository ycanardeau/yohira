import { ICollection } from '@yohira/base/ICollection';
import { IDisposable } from '@yohira/base/IDisposable';
import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceProviderOptions } from '@yohira/extensions.dependency-injection/ServiceProviderOptions';
import { ServiceProviderEngineScope } from '@yohira/extensions.dependency-injection/service-lookup/ServiceProviderEngineScope';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceProvider.cs,7b97f84895159f6d,references
export class ServiceProvider implements IServiceProvider, IDisposable {
	private disposed = false;

	root: ServiceProviderEngineScope;

	constructor(
		serviceDescriptors: ICollection<ServiceDescriptor>,
		options: ServiceProviderOptions,
	) {
		this.root = new ServiceProviderEngineScope(this, true);
		// TODO

		// TODO

		// TODO: Log.
	}

	getService = <T>(
		serviceType: string,
		serviceProviderEngineScope = this.root,
	): T | undefined => {
		if (this.disposed) {
			throw new Error('Cannot access a disposed object.' /* LOC */);
		}

		// TODO
		throw new Error('Method not implemented.');
	};

	dispose = (): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
