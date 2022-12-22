import { Type } from '@yohira/base/Type';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceCollectionServiceExtensions.cs,865c289313a49193,references
export const addSingletonType = <T>(
	services: IServiceCollection,
	serviceType: Type,
	implType: new (...args: never[]) => T,
): IServiceCollection => {
	const descriptor = ServiceDescriptor.fromType(
		ServiceLifetime.Singleton,
		serviceType,
		implType,
	);
	services.add(descriptor);
	return services;
};
