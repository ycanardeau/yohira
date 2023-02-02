import { Ctor, IServiceProvider } from '@yohira/base';

import { IServiceCollection } from './IServiceCollection';
import { ServiceDescriptor } from './ServiceDescriptor';
import { ServiceLifetime } from './ServiceLifetime';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceCollectionServiceExtensions.cs,865c289313a49193,references
export function addSingletonCtor(
	services: IServiceCollection,
	serviceType: symbol,
	implCtor: Ctor<object>,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Singleton,
		serviceType,
		implCtor,
	);
	services.add(descriptor);
	return services;
}

export function addSingletonInstance(
	services: IServiceCollection,
	serviceType: symbol,
	implInstance: object,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromInstance(
		ServiceLifetime.Singleton,
		serviceType,
		implInstance,
	);
	services.add(descriptor);
	return services;
}

export function addSingletonFactory(
	services: IServiceCollection,
	serviceType: symbol,
	implFactory: (serviceProvider: IServiceProvider) => object,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromFactory(
		ServiceLifetime.Singleton,
		serviceType,
		implFactory,
	);
	services.add(descriptor);
	return services;
}

export function addScopedCtor(
	services: IServiceCollection,
	serviceType: symbol,
	implCtor: Ctor<object>,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Scoped,
		serviceType,
		implCtor,
	);
	services.add(descriptor);
	return services;
}

export function addTransientCtor(
	services: IServiceCollection,
	serviceType: symbol,
	implCtor: Ctor<object>,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Transient,
		serviceType,
		implCtor,
	);
	services.add(descriptor);
	return services;
}
