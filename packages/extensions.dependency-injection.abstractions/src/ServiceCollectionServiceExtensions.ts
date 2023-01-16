import { IServiceCollection } from '@/IServiceCollection';
import { ServiceDescriptor } from '@/ServiceDescriptor';
import { ServiceLifetime } from '@/ServiceLifetime';
import { Ctor, IServiceProvider, Type } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceCollectionServiceExtensions.cs,865c289313a49193,references
export function addSingletonCtor(
	services: IServiceCollection,
	serviceType: Type,
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
	serviceType: Type,
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
	serviceType: Type,
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
	serviceType: Type,
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
	serviceType: Type,
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
