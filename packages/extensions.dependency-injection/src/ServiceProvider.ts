import { ICollection } from '@yohira/base/ICollection';
import { IDisposable } from '@yohira/base/IDisposable';
import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceProviderOptions } from '@yohira/extensions.dependency-injection/ServiceProviderOptions';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceProvider.cs,7b97f84895159f6d,references
export class ServiceProvider implements IServiceProvider, IDisposable {
	constructor(
		serviceDescriptors: ICollection<ServiceDescriptor>,
		options: ServiceProviderOptions,
	) {
		// TODO
	}

	getService = <T>(serviceType: string): T | undefined => {
		// TODO
		throw new Error('Method not implemented.');
	};

	dispose = (): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
