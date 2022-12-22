import { ICollection } from '@yohira/base/ICollection';
import { List } from '@yohira/base/List';
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

class ServiceDescriptorCacheItem {
	private item?: ServiceDescriptor;
	private items?: List<ServiceDescriptor>;

	get last(): ServiceDescriptor {
		if (this.items !== undefined && this.items.count > 0) {
			return this.items.get(this.items.count - 1);
		}

		if (this.item === undefined) {
			throw new Error('Assertion failed.');
		}
		return this.item;
	}

	get count(): number {
		if (this.item === undefined) {
			if (this.items !== undefined) {
				throw new Error('Assertion failed.');
			}
			return 0;
		}

		return 1 + (this.items?.count ?? 0);
	}

	get = (index: number): ServiceDescriptor => {
		if (index >= this.count) {
			throw new Error(
				'Specified argument was out of the range of valid values.' /* LOC */,
			);
		}

		if (index === 0) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return this.item!;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.items!.get(index - 1);
	};

	getSlot = (descriptor: ServiceDescriptor): number => {
		if (descriptor === this.item) {
			return this.count - 1;
		}

		if (this.items !== undefined) {
			const index = this.items.indexOf(descriptor);
			if (index !== -1) {
				return this.items.count - (index + 1);
			}
		}

		throw new Error(
			"Requested service descriptor doesn't exist." /* LOC */,
		);
	};

	add = (descriptor: ServiceDescriptor): ServiceDescriptorCacheItem => {
		const newCacheItem = new ServiceDescriptorCacheItem();
		if (this.item === undefined) {
			if (this.items !== undefined) {
				throw new Error(
					'Specified argument was out of the range of valid values.' /* LOC */,
				);
			}
			newCacheItem.item = descriptor;
		} else {
			newCacheItem.item = this.item;
			newCacheItem.items = this.items ?? new List();
			newCacheItem.items.add(descriptor);
		}
		return newCacheItem;
	};
}

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/CallSiteFactory.cs,b3200cd3834458b8,references
export class CallSiteFactory implements IServiceProviderIsService {
	private static readonly defaultSlot = 0;
	private readonly callSiteCache = new Map<number, ServiceCallSite>();
	private readonly descriptorLookup = new Map<
		Type,
		ServiceDescriptorCacheItem
	>();
	// REVIEW: callSiteLocks

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
