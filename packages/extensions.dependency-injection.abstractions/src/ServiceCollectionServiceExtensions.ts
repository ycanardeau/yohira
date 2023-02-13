import { Ctor, IServiceProvider } from '@yohira/base';

import { IServiceCollection } from './IServiceCollection';
import { ServiceDescriptor } from './ServiceDescriptor';
import { ServiceLifetime } from './ServiceLifetime';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceCollectionServiceExtensions.cs,865c289313a49193,references
export function addSingletonCtor<T extends object>(
	services: IServiceCollection,
	serviceType: symbol,
	implCtor: Ctor<T>,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Singleton,
		serviceType,
		implCtor,
	);
	services.add(descriptor);
	return services;
}

export function addSingletonInstance<T extends object>(
	services: IServiceCollection,
	serviceType: symbol,
	implInstance: T,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromInstance(
		ServiceLifetime.Singleton,
		serviceType,
		implInstance,
	);
	services.add(descriptor);
	return services;
}

export function addSingletonFactory<T extends object>(
	services: IServiceCollection,
	serviceType: symbol,
	implFactory: (serviceProvider: IServiceProvider) => T,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromFactory(
		ServiceLifetime.Singleton,
		serviceType,
		implFactory,
	);
	services.add(descriptor);
	return services;
}

export function addScopedCtor<T extends object>(
	services: IServiceCollection,
	serviceType: symbol,
	implCtor: Ctor<T>,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Scoped,
		serviceType,
		implCtor,
	);
	services.add(descriptor);
	return services;
}

export function addScopedInstance<T extends object>(
	services: IServiceCollection,
	serviceType: symbol,
	implInstance: T,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromInstance(
		ServiceLifetime.Scoped,
		serviceType,
		implInstance,
	);
	services.add(descriptor);
	return services;
}

export function addScopedFactory<T extends object>(
	services: IServiceCollection,
	serviceType: symbol,
	implFactory: (serviceProvider: IServiceProvider) => T,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromFactory(
		ServiceLifetime.Scoped,
		serviceType,
		implFactory,
	);
	services.add(descriptor);
	return services;
}

export function addTransientCtor<T extends object>(
	services: IServiceCollection,
	serviceType: symbol,
	implCtor: Ctor<T>,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Transient,
		serviceType,
		implCtor,
	);
	services.add(descriptor);
	return services;
}

export function addTransientInstance<T extends object>(
	services: IServiceCollection,
	serviceType: symbol,
	implInstance: T,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromInstance(
		ServiceLifetime.Transient,
		serviceType,
		implInstance,
	);
	services.add(descriptor);
	return services;
}

export function addTransientFactory<T extends object>(
	services: IServiceCollection,
	serviceType: symbol,
	implFactory: (serviceProvider: IServiceProvider) => T,
): IServiceCollection {
	const descriptor = ServiceDescriptor.fromFactory(
		ServiceLifetime.Transient,
		serviceType,
		implFactory,
	);
	services.add(descriptor);
	return services;
}
