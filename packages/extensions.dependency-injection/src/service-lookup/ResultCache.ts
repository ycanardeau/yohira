import { Type } from '@yohira/base/Type';
import { ServiceLifetime } from '@yohira/extensions.dependency-injection.abstractions/ServiceLifetime';
import { CallSiteResultCacheLocation } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteResultCacheLocation';
import { ServiceCacheKey } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCacheKey';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ResultCache.cs,29fb1ee4290bb7fa,references
export class ResultCache {
	location: CallSiteResultCacheLocation;
	key: ServiceCacheKey;

	constructor(
		lifetime: ServiceLifetime,
		type: Type | undefined,
		slot: number,
	) {
		if (lifetime !== ServiceLifetime.Transient && type === undefined) {
			throw new Error('Assertion failed.');
		}

		switch (lifetime) {
			case ServiceLifetime.Singleton:
				this.location = CallSiteResultCacheLocation.Root;
				break;
			case ServiceLifetime.Scoped:
				this.location = CallSiteResultCacheLocation.Scope;
				break;
			case ServiceLifetime.Transient:
				this.location = CallSiteResultCacheLocation.Dispose;
				break;
			default:
				this.location = CallSiteResultCacheLocation.None;
				break;
		}
		this.key = new ServiceCacheKey(type, slot);
	}
}
