import { IServiceProvider, keyForType } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceProviderServiceExtensions.cs,60d5205872e18356,references
export function getRequiredService<T>(
	provider: IServiceProvider,
	serviceType: symbol,
): T {
	// TODO

	const service = provider.getService<T>(serviceType);
	if (service === undefined) {
		throw new Error(
			`No service for type '${keyForType(
				serviceType,
			)}' has been registered.` /* LOC */,
		);
	}

	return service;
}

export function getServices<T>(
	provider: IServiceProvider,
	serviceType: symbol,
): T[] {
	return getRequiredService<T[]>(
		provider,
		Symbol.for(`Iterable<${keyForType(serviceType)}>`),
	);
}
