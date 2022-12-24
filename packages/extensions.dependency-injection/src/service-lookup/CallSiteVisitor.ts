import { CallSiteKind } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteKind';
import { CallSiteResultCacheLocation } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteResultCacheLocation';
import { ConstantCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ConstantCallSite';
import { CtorCallSite } from '@yohira/extensions.dependency-injection/service-lookup/CtorCallSite';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';

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

	/* TODO: protected abstract visitServiceProvider(
		serviceProviderCallSite: ServiceProviderCallSite,
		argument: TArgument,
	): TResult;*/

	/* TODO: protected abstract visitIEnumerable(
		enumerableCallSite: IEnumerableCallSite,
		argument: TArgument,
	): TResult;*/

	/* TODO: protected abstract visitFactory(
		factoryCallSite: FactoryCallSite,
		argument: TArgument,
	): TResult;*/

	protected visitCallSiteMain = (
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult => {
		switch (callSite.kind) {
			case CallSiteKind.Factory:
				throw new Error('Method not implemented.');
			case CallSiteKind.IEnumerable:
				throw new Error('Method not implemented.');
			case CallSiteKind.Ctor:
				return this.visitCtor(callSite as CtorCallSite, argument);
			case CallSiteKind.Constant:
				return this.visitConstant(
					callSite as ConstantCallSite,
					argument,
				);
			case CallSiteKind.ServiceProvider:
				throw new Error('Method not implemented.');
		}
	};

	protected visitRootCache = (
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult => {
		return this.visitCallSiteMain(callSite, argument);
	};

	protected visitScopeCache = (
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult => {
		return this.visitCallSiteMain(callSite, argument);
	};

	protected visitDisposeCache = (
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult => {
		return this.visitCallSiteMain(callSite, argument);
	};

	protected visitNoCache = (
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult => {
		return this.visitCallSiteMain(callSite, argument);
	};

	protected visitCallSite = (
		callSite: ServiceCallSite,
		argument: TArgument,
	): TResult => {
		// TODO

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
	};
}
