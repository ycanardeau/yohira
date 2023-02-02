// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceProviderOptions.cs,ee974b491ff62d92,references
export class ServiceProviderOptions {
	static readonly default = new ServiceProviderOptions();

	/**
	 * <c>true</c> to perform check verifying that scoped services never gets resolved from root provider; otherwise <c>false</c>. Defaults to <c>false</c>.
	 */
	validateScopes = false;
	/**
	 * <c>true</c> to perform check verifying that all services can be created during <c>BuildServiceProvider</c> call; otherwise <c>false</c>. Defaults to <c>false</c>.
	 * NOTE: this check doesn't verify open generics services.
	 */
	validateOnBuild = false;
}
