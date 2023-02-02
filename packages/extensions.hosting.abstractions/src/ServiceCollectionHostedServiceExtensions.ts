import { Ctor } from '@yohira/base';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddServiceDescriptorIterable,
} from '@yohira/extensions.dependency-injection.abstractions';

import { IHostedService } from './IHostedService';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/ServiceCollectionHostedServiceExtensions.cs,7a9ac7b282b7b4d3,references
export function addHostedService<THostedService extends IHostedService>(
	hostedServiceType: Ctor<THostedService>,
	services: IServiceCollection,
): IServiceCollection {
	tryAddServiceDescriptorIterable(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Symbol.for('IHostedService'),
			hostedServiceType,
		),
	);

	return services;
}
