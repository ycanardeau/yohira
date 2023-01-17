import { CallSiteRuntimeResolver } from '../service-lookup/CallSiteRuntimeResolver';
import { ServiceCallSite } from '../service-lookup/ServiceCallSite';
import { ServiceProviderEngine } from '../service-lookup/ServiceProviderEngine';
import { ServiceProviderEngineScope } from '../service-lookup/ServiceProviderEngineScope';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/RuntimeServiceProviderEngine.cs,e09406027be79cd6,references
export class RuntimeServiceProviderEngine extends ServiceProviderEngine {
	static readonly instance = new RuntimeServiceProviderEngine();

	realizeService(
		callSite: ServiceCallSite,
	): (
		serviceProviderEngineScope: ServiceProviderEngineScope,
	) => object | undefined {
		return (scope) => {
			return CallSiteRuntimeResolver.instance.resolve(callSite, scope);
		};
	}
}
