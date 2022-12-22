// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceLifetime.cs,50d19df329ece36d,references
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
