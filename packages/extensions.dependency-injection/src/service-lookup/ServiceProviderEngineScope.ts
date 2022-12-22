import { ServiceProvider } from '@yohira/extensions.dependency-injection/ServiceProvider';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceProviderEngineScope.cs,da6e7172da9cbbcf,references
export class ServiceProviderEngineScope {
	constructor(
		readonly rootProvider: ServiceProvider,
		readonly isRootScope: boolean,
	) {}
}
