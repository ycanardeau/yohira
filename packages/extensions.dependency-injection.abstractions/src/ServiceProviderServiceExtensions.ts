import { IServiceProvider, keyForType } from '@yohira/base';

import { AsyncServiceScope } from './AsyncServiceScope';
import { IServiceScope } from './IServiceScope';
import { IServiceScopeFactory } from './IServiceScopeFactory';

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

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceProviderServiceExtensions.cs,f2e7eaaea226269d,references
export function createScopeFromProvider(
	provider: IServiceProvider,
): IServiceScope {
	return getRequiredService<IServiceScopeFactory>(
		provider,
		IServiceScopeFactory,
	).createScope();
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceProviderServiceExtensions.cs,478af7c6d9193e2a,references
export function createAsyncScopeFromProvider(
	provider: IServiceProvider,
): AsyncServiceScope {
	return new AsyncServiceScope(createScopeFromProvider(provider));
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceProviderServiceExtensions.cs,f45ecbe0b9fb9005,references
export function createAsyncScopeFromServiceScopeFactory(
	serviceScopeFactory: IServiceScopeFactory,
): AsyncServiceScope {
	return new AsyncServiceScope(serviceScopeFactory.createScope());
}
