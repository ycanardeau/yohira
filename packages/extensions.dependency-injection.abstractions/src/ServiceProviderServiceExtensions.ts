import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { Type } from '@yohira/base/Type';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceProviderServiceExtensions.cs,60d5205872e18356,references
export const getRequiredService = <T>(
	provider: IServiceProvider,
	serviceType: Type,
): T => {
	// TODO

	const service = provider.getService<T>(serviceType);
	if (service === undefined) {
		throw new Error(
			`No service for type '${serviceType}' has been registered.` /* LOC */,
		);
	}

	return service;
};