import { tryGetValue } from '@yohira/base/MapExtensions';
import { Type } from '@yohira/base/Type';
import { IServiceScope } from '@yohira/extensions.dependency-injection.abstractions/IServiceScope';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';
import { CallSiteVisitor } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteVisitor';
import { CtorCallSite } from '@yohira/extensions.dependency-injection/service-lookup/CtorCallSite';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';

class CallSiteValidatorState {
	singleton?: ServiceCallSite;
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteValidator.cs,80039ca1254de7d7,references
export class CallSiteValidator extends CallSiteVisitor<
	CallSiteValidatorState,
	Type | undefined
> {
	private readonly scopedServices = new Map<Type, Type>();

	validateCallSite = (callSite: ServiceCallSite): void => {
		const scoped = this.visitCallSite(
			callSite,
			new CallSiteValidatorState(),
		);
		if (scoped !== undefined) {
			this.scopedServices.set(callSite.serviceType, scoped);
		}
	};

	validateResolution = (
		serviceType: Type,
		scope: IServiceScope,
		rootScope: IServiceScope,
	): void => {
		if (scope === rootScope) {
			const tryGetValueResult = tryGetValue(
				this.scopedServices,
				serviceType,
			);
			if (tryGetValueResult.ok) {
				const { val: scopedService } = tryGetValueResult;
				if (serviceType === scopedService) {
					throw new Error(
						`Cannot resolve ${[
							ServiceLifetime[
								ServiceLifetime.Scoped
							].toLowerCase(),
						]} service '${serviceType}' from root provider.` /* LOC */,
					);
				}

				throw new Error(
					`Cannot resolve '${serviceType}' from root provider because it requires ${ServiceLifetime[
						ServiceLifetime.Scoped
					].toLowerCase()} service '${scopedService}'.` /* LOC */,
				);
			}
		}
	};

	protected visitCtor = (
		ctorCallSite: CtorCallSite,
		state: CallSiteValidatorState,
	): Type | undefined => {
		let result: Type | undefined = undefined;
		for (const parameterCallSite of ctorCallSite.parameterCallSites) {
			const scoped = this.visitCallSite(parameterCallSite, state);
			result ??= scoped;
		}
		return result;
	};

	protected visitConstant = (): Type | undefined => {
		return undefined;
	};

	protected visitRootCache = (
		singletonCallSite: ServiceCallSite,
		state: CallSiteValidatorState,
	): Type | undefined => {
		state.singleton = singletonCallSite;
		return this.visitCallSiteMain(singletonCallSite, state);
	};

	protected visitScopeCache = (
		scopedCallSite: ServiceCallSite,
		state: CallSiteValidatorState,
	): Type | undefined => {
		// TODO: IServiceScopeFactory
		if (state.singleton !== undefined) {
			throw new Error(
				`Cannot consume ${ServiceLifetime[
					ServiceLifetime.Scoped
				].toLowerCase()} service '${
					scopedCallSite.serviceType
				}' from ${ServiceLifetime[
					ServiceLifetime.Singleton
				].toLowerCase()} '${state.singleton.serviceType}'.`,
			);
		}

		this.visitCallSiteMain(scopedCallSite, state);
		return scopedCallSite.serviceType;
	};
}
