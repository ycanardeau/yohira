import { CallSiteKind } from './CallSiteKind';
import { CallSiteResultCacheLocation } from './CallSiteResultCacheLocation';
import { ConstantCallSite } from './ConstantCallSite';
import { CtorCallSite } from './CtorCallSite';
import { FactoryCallSite } from './FactoryCallSite';
import { IterableCallSite } from './IterableCallSite';
import { ServiceCallSite } from './ServiceCallSite';
import { ServiceProviderCallSite } from './ServiceProviderCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteVisitor.cs,830d006141417efa,references
export abstract class CallSiteVisitor<TArgument, TResult> {
	protected abstract visitCtor(
		ctorCallSite: CtorCallSite,
		argument: TArgument,
	): TResult;

	protected abstract visitConstant(
		constantCallSite: ConstantCallSite,
		argument: TArgument,
	): TResult;

	protected abstract visitServiceProvider(
		serviceProviderCallSite: ServiceProviderCallSite,
		argument: TArgument,
	): TResult;

	protected abstract visitIterable(
		iterableCallSite: IterableCallSite,
		argument: TArgument,
	): TResult;

	protected abstract visitFactory(
		factoryCallSite: FactoryCallSite,
		argument: TArgument,
	): TResult;

	protected visitCallSiteMain(
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult {
		switch (callSite.kind) {
			case CallSiteKind.Factory:
				return this.visitFactory(callSite as FactoryCallSite, argument);
			case CallSiteKind.Iterable:
				return this.visitIterable(
					callSite as IterableCallSite,
					argument,
				);
			case CallSiteKind.Ctor:
				return this.visitCtor(callSite as CtorCallSite, argument);
			case CallSiteKind.Constant:
				return this.visitConstant(
					callSite as ConstantCallSite,
					argument,
				);
			case CallSiteKind.ServiceProvider:
				return this.visitServiceProvider(
					callSite as ServiceProviderCallSite,
					argument,
				);
		}
	}

	protected visitRootCache(
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult {
		return this.visitCallSiteMain(callSite, argument);
	}

	protected visitScopeCache(
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult {
		return this.visitCallSiteMain(callSite, argument);
	}

	protected visitDisposeCache(
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult {
		return this.visitCallSiteMain(callSite, argument);
	}

	protected visitNoCache(
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult {
		return this.visitCallSiteMain(callSite, argument);
	}

	protected visitCallSite(
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult {
		// REVIEW: tryEnterOnCurrentStack

		switch (callSite.cache.location) {
			case CallSiteResultCacheLocation.Root:
				return this.visitRootCache(callSite, argument);
			case CallSiteResultCacheLocation.Scope:
				return this.visitScopeCache(callSite, argument);
			case CallSiteResultCacheLocation.Dispose:
				return this.visitDisposeCache(callSite, argument);
			case CallSiteResultCacheLocation.None:
				return this.visitNoCache(callSite, argument);
		}
	}
}
