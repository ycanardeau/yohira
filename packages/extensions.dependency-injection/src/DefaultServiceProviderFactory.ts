import { IServiceProvider } from '@yohira/base';
import {
	IServiceCollection,
	IServiceProviderFactory,
} from '@yohira/extensions.dependency-injection.abstractions';

import { buildServiceProvider } from './ServiceCollectionContainerBuilderExtensions';
import { ServiceProviderOptions } from './ServiceProviderOptions';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/DefaultServiceProviderFactory.cs,393bb8d374e6400d,references
export class DefaultServiceProviderFactory
	implements IServiceProviderFactory<IServiceCollection>
{
	constructor(private readonly options = ServiceProviderOptions.default) {}

	createBuilder(services: IServiceCollection): IServiceCollection {
		return services;
	}

	createServiceProvider(
		containerBuilder: IServiceCollection,
	): IServiceProvider {
		return buildServiceProvider(containerBuilder, this.options);
	}
}
