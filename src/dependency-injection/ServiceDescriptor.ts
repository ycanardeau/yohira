// TODO: Move.
import 'reflect-metadata';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.DependencyInjection.Abstractions/src/ServiceLifetime.cs#L9
export enum ServiceLifetime {
	/**
	 * Specifies that a single instance of the service will be created.
	 */
	Singleton,
	/**
	 * Specifies that a new instance of the service will be created for each scope.
	 */
	Scoped,
	/**
	 * Specifies that a new instance of the service will be created every time it is requested.
	 */
	Transient,
}

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.DependencyInjection.Abstractions/src/ServiceDescriptor.cs#L14
export type ServiceDescriptor = {
	serviceType: symbol;
	T: string | undefined;
	lifetime: ServiceLifetime;
} & (
	| { implementationType: new (...args: never[]) => unknown /* TODO */ }
	| { implementationInstance: object }
);

const describe = <TImplementation>(
	serviceType: symbol,
	T: string | undefined,
	implementationType: new (...args: never[]) => TImplementation,
	lifetime: ServiceLifetime,
): ServiceDescriptor => {
	return {
		serviceType,
		T,
		implementationType,
		lifetime,
	};
};

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.DependencyInjection.Abstractions/src/ServiceDescriptor.cs#L317
export const singleton = <TImplementation>(
	serviceType: symbol,
	T: string | undefined,
	implementationType: new (...args: never[]) => TImplementation,
): ServiceDescriptor => {
	return describe(
		serviceType,
		T,
		implementationType,
		ServiceLifetime.Singleton,
	);
};
