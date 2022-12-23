import { CallSiteVisitor } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteVisitor';
import { CtorCallSite } from '@yohira/extensions.dependency-injection/service-lookup/CtorCallSite';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';
import { ServiceProviderEngineScope } from '@yohira/extensions.dependency-injection/service-lookup/ServiceProviderEngineScope';

class RuntimeResolverContext {
	constructor(readonly scope: ServiceProviderEngineScope) {}
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteRuntimeResolver.cs,90d7e01488bf46cd,references
export class CallSiteRuntimeResolver extends CallSiteVisitor<
	RuntimeResolverContext,
	object | undefined
> {
	static readonly instance = new CallSiteRuntimeResolver();

	protected visitCtor = (
		ctorCallSite: CtorCallSite,
		context: RuntimeResolverContext,
	): object | undefined => {
		const parameterValues = ctorCallSite.parameterCallSites.map(
			(parameterCallSite) =>
				this.visitCallSite(parameterCallSite, context),
		);
		return new ctorCallSite.implCtor(...parameterValues);
	};

	resolve = (
		callSite: ServiceCallSite,
		scope: ServiceProviderEngineScope,
	): object | undefined => {
		if (scope.isRootScope && callSite.value !== undefined) {
			return callSite.value;
		}

		return this.visitCallSite(callSite, new RuntimeResolverContext(scope));
	};
}
