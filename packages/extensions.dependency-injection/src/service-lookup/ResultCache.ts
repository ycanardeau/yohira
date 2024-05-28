import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions';

import { CallSiteResultCacheLocation } from './CallSiteResultCacheLocation';
import { ServiceCacheKey } from './ServiceCacheKey';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ResultCache.cs,29fb1ee4290bb7fa,references
export class ResultCache {
	constructor(
		public location: CallSiteResultCacheLocation,
		public key: ServiceCacheKey,
	) {}

	static readonly none = new ResultCache(
		CallSiteResultCacheLocation.None,
		ServiceCacheKey.empty(),
	);

	static create(
		lifetime: ServiceLifetime,
		type: symbol | undefined,
		slot: number,
	): ResultCache {
		if (lifetime !== ServiceLifetime.Transient && type === undefined) {
			throw new Error('Assertion failed.');
		}

		const key = new ServiceCacheKey(type, slot);
		switch (lifetime) {
			case ServiceLifetime.Singleton:
				return new ResultCache(CallSiteResultCacheLocation.Root, key);
			case ServiceLifetime.Scoped:
				return new ResultCache(CallSiteResultCacheLocation.Scope, key);
			case ServiceLifetime.Transient:
				return new ResultCache(
					CallSiteResultCacheLocation.Dispose,
					key,
				);
			default:
				return new ResultCache(CallSiteResultCacheLocation.None, key);
		}
	}
}
