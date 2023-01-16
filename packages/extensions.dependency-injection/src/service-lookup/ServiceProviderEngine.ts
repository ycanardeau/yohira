import { ServiceCallSite } from '@/service-lookup/ServiceCallSite';
import { ServiceProviderEngineScope } from '@/service-lookup/ServiceProviderEngineScope';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceProviderEngine.cs,afd54d529ed3bfb7,references
export abstract class ServiceProviderEngine {
	abstract realizeService(
		callSite: ServiceCallSite,
	): (
		serviceProviderEngineScope: ServiceProviderEngineScope,
	) => object | undefined;
}
