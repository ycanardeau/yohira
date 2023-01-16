import { IHostedService } from '@/IHostedService';
import { Ctor, Type } from '@yohira/base';
import {
	IServiceCollection,
	ServiceDescriptor,
	ServiceLifetime,
	tryAddIterable,
} from '@yohira/extensions.dependency-injection.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/ServiceCollectionHostedServiceExtensions.cs,7a9ac7b282b7b4d3,references
export function addHostedService<THostedService extends IHostedService>(
	services: IServiceCollection,
	hostedServiceType: Ctor<THostedService>,
): IServiceCollection {
	tryAddIterable(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			Type.from('IHostedService'),
			hostedServiceType,
		),
	);

	return services;
}
