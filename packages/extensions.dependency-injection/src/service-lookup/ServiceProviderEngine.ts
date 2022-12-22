import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';
import { ServiceProviderEngineScope } from '@yohira/extensions.dependency-injection/service-lookup/ServiceProviderEngineScope';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceProviderEngine.cs,afd54d529ed3bfb7,references
export abstract class ServiceProviderEngine {
	abstract realizeService(
		callSite: ServiceCallSite,
	): (
		serviceProviderEngineScope: ServiceProviderEngineScope,
	) => object | undefined;
}
