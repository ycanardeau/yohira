import { Ctor, Type } from '@yohira/base/Type';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceCollectionServiceExtensions.cs,865c289313a49193,references
export const addSingletonCtor = (
	services: IServiceCollection,
	serviceType: Type,
	implCtor: Ctor<object>,
): IServiceCollection => {
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Singleton,
		serviceType,
		implCtor,
	);
	services.add(descriptor);
	return services;
};

export const addSingletonInstance = (
	services: IServiceCollection,
	serviceType: Type,
	implInstance: object,
): IServiceCollection => {
	const descriptor = ServiceDescriptor.fromInstance(
		ServiceLifetime.Singleton,
		serviceType,
		implInstance,
	);
	services.add(descriptor);
	return services;
};

export const addScopedCtor = (
	services: IServiceCollection,
	serviceType: Type,
	implCtor: Ctor<object>,
): IServiceCollection => {
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Scoped,
		serviceType,
		implCtor,
	);
	services.add(descriptor);
	return services;
};

export const addTransientCtor = (
	services: IServiceCollection,
	serviceType: Type,
	implCtor: Ctor<object>,
): IServiceCollection => {
	const descriptor = ServiceDescriptor.fromCtor(
		ServiceLifetime.Transient,
		serviceType,
		implCtor,
	);
	services.add(descriptor);
	return services;
};
