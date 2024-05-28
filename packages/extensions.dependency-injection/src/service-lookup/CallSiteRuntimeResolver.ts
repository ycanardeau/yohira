import { tryGetValue } from '@yohira/base';

import { CallSiteVisitor } from './CallSiteVisitor';
import { ConstantCallSite } from './ConstantCallSite';
import { CtorCallSite } from './CtorCallSite';
import { FactoryCallSite } from './FactoryCallSite';
import { IterableCallSite } from './IterableCallSite';
import { ServiceCallSite } from './ServiceCallSite';
import { ServiceProviderCallSite } from './ServiceProviderCallSite';
import { ServiceProviderEngineScope } from './ServiceProviderEngineScope';

class RuntimeResolverContext {
	constructor(readonly scope: ServiceProviderEngineScope) {}
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteRuntimeResolver.cs,90d7e01488bf46cd,references
export class CallSiteRuntimeResolver extends CallSiteVisitor<
	RuntimeResolverContext,
	object | undefined
> {
	static readonly instance = new CallSiteRuntimeResolver();

	protected visitCtor(
		ctorCallSite: CtorCallSite,
		context: RuntimeResolverContext,
	): object | undefined {
		const parameterValues = ctorCallSite.parameterCallSites.map(
			(parameterCallSite) =>
				this.visitCallSite(parameterCallSite, context),
		);
		return new ctorCallSite.implCtor(...parameterValues);
	}

	protected visitConstant(
		constantCallSite: ConstantCallSite,
	): object | undefined {
		return constantCallSite.defaultValue;
	}

	protected visitServiceProvider(
		serviceProviderCallSite: ServiceProviderCallSite,
		context: RuntimeResolverContext,
	): object | undefined {
		return context.scope;
	}

	protected visitIterable(
		iterableCallSite: IterableCallSite,
		context: RuntimeResolverContext,
	): object | undefined {
		return iterableCallSite.serviceCallSites.map((serviceCallSite) =>
			this.visitCallSite(serviceCallSite, context),
		);
	}

	protected visitFactory(
		factoryCallSite: FactoryCallSite,
		context: RuntimeResolverContext,
	): object | undefined {
		return factoryCallSite.factory(context.scope);
	}

	visitRootCache(
		callSite: ServiceCallSite,
		context: RuntimeResolverContext,
	): object | undefined {
		if (callSite.value !== undefined) {
			// Value already calculated, return it directly
			return callSite.value;
		}

		// REVIEW: Lock.
		const serviceProviderEngine = context.scope.rootProvider.root;

		// REVIEW: Lock.
		if (callSite.value !== undefined) {
			return callSite.value;
		}

		const resolved = this.visitCallSiteMain(
			callSite,
			new RuntimeResolverContext(serviceProviderEngine),
		);
		serviceProviderEngine.captureDisposable(resolved);
		callSite.value = resolved;
		return resolved;
	}

	private visitCache(
		callSite: ServiceCallSite,
		context: RuntimeResolverContext,
		serviceProviderEngine: ServiceProviderEngineScope,
		// TODO
	): object | undefined {
		// REVIEW
		const resolvedServices = serviceProviderEngine.resolvedServices;
		// REVIEW

		// REVIEW: try
		const tryGetValueResult = tryGetValue(
			resolvedServices,
			callSite.cache.key.getHashCode(),
		);
		if (tryGetValueResult.ok) {
			return tryGetValueResult.val;
		}

		const resolved = this.visitCallSiteMain(
			callSite,
			new RuntimeResolverContext(
				serviceProviderEngine /* REVIEW: acquiredLocks */,
			),
		);
		serviceProviderEngine.captureDisposable(resolved);
		resolvedServices.set(callSite.cache.key.getHashCode(), resolved);
		return resolved;
		// REVIEW: finally
	}

	visitScopeCache(
		callSite: ServiceCallSite,
		context: RuntimeResolverContext,
	): object | undefined {
		return context.scope.isRootScope
			? this.visitRootCache(callSite, context)
			: this.visitCache(
					callSite,
					context,
					context.scope,
					// TODO: RuntimeResolverLock.Scope,
			  );
	}

	visitDisposeCache(
		transientCallSite: ServiceCallSite,
		context: RuntimeResolverContext,
	): object | undefined {
		return context.scope.captureDisposable(
			this.visitCallSiteMain(transientCallSite, context),
		);
		return this.visitCallSiteMain(transientCallSite, context);
	}

	resolve(
		callSite: ServiceCallSite,
		scope: ServiceProviderEngineScope,
	): object | undefined {
		if (scope.isRootScope && callSite.value !== undefined) {
			return callSite.value;
		}

		return this.visitCallSite(callSite, new RuntimeResolverContext(scope));
	}
}
