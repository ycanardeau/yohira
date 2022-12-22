import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';
import { ServiceProviderEngineScope } from '@yohira/extensions.dependency-injection/service-lookup/ServiceProviderEngineScope';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteRuntimeResolver.cs,90d7e01488bf46cd,references
export class CallSiteRuntimeResolver /* TODO: extends CallSiteVisitor */ {
	static readonly instance = new CallSiteRuntimeResolver();

	resolve = (
		callSite: ServiceCallSite,
		scope: ServiceProviderEngineScope,
	): object | undefined => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
