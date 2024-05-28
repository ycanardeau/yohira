import { CallSiteRuntimeResolver } from './CallSiteRuntimeResolver';
import { ServiceCallSite } from './ServiceCallSite';
import { ServiceProviderEngine } from './ServiceProviderEngine';
import { ServiceProviderEngineScope } from './ServiceProviderEngineScope';

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
