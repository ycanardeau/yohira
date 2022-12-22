import { ICollection } from '@yohira/base/ICollection';
import { Type } from '@yohira/base/Type';
import { IServiceProviderIsService } from '@yohira/extensions.dependency-injection.abstractions/IServiceProviderIsService';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';
import { CallSiteChain } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteChain';
import { ServiceCacheKey } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCacheKey';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';
import { Err, Ok, Result } from 'ts-results-es';

const tryGetValue = <K, V>(map: Map<K, V>, key: K): Result<V, undefined> => {
	if (map.has(key)) {
		return new Ok(map.get(key) as V);
	} else {
		return new Err(undefined);
	}
};

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteFactory.cs,b3200cd3834458b8,references
export class CallSiteFactory implements IServiceProviderIsService {
	private static readonly defaultSlot = 0;
	private readonly callSiteCache = new Map<number, ServiceCallSite>();

	constructor(descriptors: ICollection<ServiceDescriptor>) {}

	private tryCreateExact = (
		serviceType: Type,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined => {
		// TODO

		return undefined;
	};

	private tryCreateOpenGeneric = (
		serviceType: Type,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined => {
		// TODO

		return undefined;
	};

	private tryCreateEnumerable = (
		serviceType: Type,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined => {
		// TODO

		return undefined;
	};

	private createCallSite = (
		serviceType: Type,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined => {
		// REVIEW

		// REVIEW: Lock.
		const callSite =
			this.tryCreateExact(serviceType, callSiteChain) ??
			this.tryCreateOpenGeneric(serviceType, callSiteChain) ??
			this.tryCreateEnumerable(serviceType, callSiteChain);

		return callSite;
	};

	getCallSite = (
		serviceType: Type,
		callSiteChain: CallSiteChain,
	): ServiceCallSite | undefined => {
		const tryGetValueResult = tryGetValue(
			this.callSiteCache,
			new ServiceCacheKey(
				serviceType,
				CallSiteFactory.defaultSlot,
			).getHashCode(),
		);
		return tryGetValueResult.ok
			? tryGetValueResult.val
			: this.createCallSite(serviceType, callSiteChain);
	};

	isService = (serviceType: Type): boolean => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
