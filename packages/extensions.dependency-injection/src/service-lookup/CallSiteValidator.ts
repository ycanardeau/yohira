import { keyForType, tryGetValue } from '@yohira/base';
import {
	IServiceScope,
	ServiceLifetime,
} from '@yohira/extensions.dependency-injection.abstractions';

import { CallSiteVisitor } from './CallSiteVisitor';
import { CtorCallSite } from './CtorCallSite';
import { IterableCallSite } from './IterableCallSite';
import { ServiceCallSite } from './ServiceCallSite';

class CallSiteValidatorState {
	singleton: ServiceCallSite | undefined;
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteValidator.cs,80039ca1254de7d7,references
export class CallSiteValidator extends CallSiteVisitor<
	CallSiteValidatorState,
	symbol | undefined
> {
	private readonly scopedServices = new Map<symbol, symbol>();

	validateCallSite(callSite: ServiceCallSite): void {
		const scoped = this.visitCallSite(
			callSite,
			new CallSiteValidatorState(),
		);
		if (scoped !== undefined) {
			this.scopedServices.set(callSite.serviceType, scoped);
		}
	}

	validateResolution(
		serviceType: symbol,
		scope: IServiceScope,
		rootScope: IServiceScope,
	): void {
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
						]} service '${keyForType(
							serviceType,
						)}' from root provider.` /* LOC */,
					);
				}

				throw new Error(
					`Cannot resolve '${keyForType(
						serviceType,
					)}' from root provider because it requires ${ServiceLifetime[
						ServiceLifetime.Scoped
					].toLowerCase()} service '${keyForType(
						scopedService,
					)}'.` /* LOC */,
				);
			}
		}
	}

	protected visitCtor(
		ctorCallSite: CtorCallSite,
		state: CallSiteValidatorState,
	): symbol | undefined {
		let result: symbol | undefined = undefined;
		for (const parameterCallSite of ctorCallSite.parameterCallSites) {
			const scoped = this.visitCallSite(parameterCallSite, state);
			result ??= scoped;
		}
		return result;
	}

	protected visitConstant(): symbol | undefined {
		return undefined;
	}

	protected visitServiceProvider(): symbol | undefined {
		return undefined;
	}

	protected visitIterable(
		iterableCallSite: IterableCallSite,
		state: CallSiteValidatorState,
	): symbol | undefined {
		let result: symbol | undefined = undefined;
		for (const serviceCallSite of iterableCallSite.serviceCallSites) {
			const scoped = this.visitCallSite(serviceCallSite, state);
			result ??= scoped;
		}
		return result;
	}

	protected visitFactory(): symbol | undefined {
		return undefined;
	}

	protected visitRootCache(
		singletonCallSite: ServiceCallSite,
		state: CallSiteValidatorState,
	): symbol | undefined {
		state.singleton = singletonCallSite;
		return this.visitCallSiteMain(singletonCallSite, state);
	}

	protected visitScopeCache(
		scopedCallSite: ServiceCallSite,
		state: CallSiteValidatorState,
	): symbol | undefined {
		// TODO: IServiceScopeFactory
		if (state.singleton !== undefined) {
			throw new Error(
				`Cannot consume ${ServiceLifetime[
					ServiceLifetime.Scoped
				].toLowerCase()} service '${keyForType(
					scopedCallSite.serviceType,
				)}' from ${ServiceLifetime[
					ServiceLifetime.Singleton
				].toLowerCase()} '${keyForType(state.singleton.serviceType)}'.`,
			);
		}

		this.visitCallSiteMain(scopedCallSite, state);
		return scopedCallSite.serviceType;
	}
}
