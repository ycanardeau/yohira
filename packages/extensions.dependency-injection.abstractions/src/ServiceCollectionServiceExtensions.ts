import { Ctor, Type } from '@yohira/base/Type';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceCollectionServiceExtensions.cs,865c289313a49193,references
export const addSingletonType = (
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
