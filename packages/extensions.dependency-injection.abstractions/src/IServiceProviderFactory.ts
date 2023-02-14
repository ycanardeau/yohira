import { IServiceProvider } from '@yohira/base';

import { IServiceCollection } from './IServiceCollection';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/IServiceProviderFactory.cs,e7de9bca812428e8,references
export interface IServiceProviderFactory<TContainerBuilder> {
	createBuilder(services: IServiceCollection): TContainerBuilder;
	createServiceProvider(
		containerBuilder: TContainerBuilder,
	): IServiceProvider;
}
