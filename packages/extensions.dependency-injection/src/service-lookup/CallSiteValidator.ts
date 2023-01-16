import { CallSiteVisitor } from '@/service-lookup/CallSiteVisitor';
import { CtorCallSite } from '@/service-lookup/CtorCallSite';
import { FactoryCallSite } from '@/service-lookup/FactoryCallSite';
import { IterableCallSite } from '@/service-lookup/IterableCallSite';
import { ServiceCallSite } from '@/service-lookup/ServiceCallSite';
import { Type, tryGetValue } from '@yohira/base';
import {
	IServiceScope,
	ServiceLifetime,
} from '@yohira/extensions.dependency-injection.abstractions';

class CallSiteValidatorState {
	singleton?: ServiceCallSite;
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteValidator.cs,80039ca1254de7d7,references
export class CallSiteValidator extends CallSiteVisitor<
	CallSiteValidatorState,
	Type | undefined
> {
	private readonly scopedServices = new Map<
		string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
		Type
	>();

	validateCallSite(callSite: ServiceCallSite): void {
		const scoped = this.visitCallSite(
			callSite,
			new CallSiteValidatorState(),
		);
		if (scoped !== undefined) {
			this.scopedServices.set(callSite.serviceType.value, scoped);
		}
	}

	validateResolution(
		serviceType: Type,
		scope: IServiceScope,
		rootScope: IServiceScope,
	): void {
		if (scope === rootScope) {
			const tryGetValueResult = tryGetValue(
				this.scopedServices,
				serviceType.value,
			);
			if (tryGetValueResult.ok) {
				const { val: scopedService } = tryGetValueResult;
				if (serviceType.equals(scopedService)) {
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
	}

	protected visitCtor(
		ctorCallSite: CtorCallSite,
		state: CallSiteValidatorState,
	): Type | undefined {
		let result: Type | undefined = undefined;
		for (const parameterCallSite of ctorCallSite.parameterCallSites) {
			const scoped = this.visitCallSite(parameterCallSite, state);
			result ??= scoped;
		}
		return result;
	}

	protected visitConstant(): Type | undefined {
		return undefined;
	}

	protected visitIterable(
		iterableCallSite: IterableCallSite,
		state: CallSiteValidatorState,
	): Type | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	protected visitFactory(
		factoryCallSite: FactoryCallSite,
		state: CallSiteValidatorState,
	): Type | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	protected visitRootCache(
		singletonCallSite: ServiceCallSite,
		state: CallSiteValidatorState,
	): Type | undefined {
		state.singleton = singletonCallSite;
		return this.visitCallSiteMain(singletonCallSite, state);
	}

	protected visitScopeCache(
		scopedCallSite: ServiceCallSite,
		state: CallSiteValidatorState,
	): Type | undefined {
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
	}
}
