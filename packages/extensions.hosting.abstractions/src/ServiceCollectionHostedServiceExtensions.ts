import { Ctor } from '@yohira/base/Type';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';
import { tryAddIterable } from '@yohira/extensions.dependency-injection.abstractions/extensions/ServiceCollectionDescriptorExtensions';
import { IHostedService } from '@yohira/extensions.hosting.abstractions/IHostedService';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/ServiceCollectionHostedServiceExtensions.cs,7a9ac7b282b7b4d3,references
export const addHostedService = <THostedService extends IHostedService>(
	services: IServiceCollection,
	hostedServiceType: Ctor<THostedService>,
): IServiceCollection => {
	tryAddIterable(
		services,
		ServiceDescriptor.fromCtor(
			ServiceLifetime.Singleton,
			'IHostedService',
			hostedServiceType,
		),
	);

	return services;
};
