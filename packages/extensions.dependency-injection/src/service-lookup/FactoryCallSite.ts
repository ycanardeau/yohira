import { CallSiteKind } from '@/service-lookup/CallSiteKind';
import { ResultCache } from '@/service-lookup/ResultCache';
import { ServiceCallSite } from '@/service-lookup/ServiceCallSite';
import { IServiceProvider, Type } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/FactoryCallSite.cs,07787b7d1aa520f0,references
export class FactoryCallSite extends ServiceCallSite {
	readonly kind = CallSiteKind.Factory;

	constructor(
		cache: ResultCache,
		readonly serviceType: Type,
		readonly factory: (serviceProvider: IServiceProvider) => object,
	) {
		super(cache);
	}
}
