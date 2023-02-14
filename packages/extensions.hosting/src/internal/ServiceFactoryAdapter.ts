import { IServiceProvider } from '@yohira/base';
import {
	IServiceCollection,
	IServiceProviderFactory,
} from '@yohira/extensions.dependency-injection.abstractions';

import { IServiceFactoryAdapter } from './IServiceFactoryAdapter';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/ServiceFactoryAdapter.cs,5f7c53f553582132,references
export class ServiceFactoryAdapter<TContainerBuilder extends object>
	implements IServiceFactoryAdapter
{
	constructor(
		private serviceProviderFactory?: IServiceProviderFactory<TContainerBuilder>,
	) {}

	createBuilder(services: IServiceCollection): object {
		if (this.serviceProviderFactory === undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}
		return this.serviceProviderFactory.createBuilder(services);
	}

	createServiceProvider(containerBuilder: object): IServiceProvider {
		if (this.serviceProviderFactory === undefined) {
			throw new Error(
				'createBuilder must be called before createServiceProvider' /* LOC */,
			);
		}

		return this.serviceProviderFactory.createServiceProvider(
			containerBuilder as TContainerBuilder,
		);
	}
}
