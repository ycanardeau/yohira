import { CallSiteKind } from '@/service-lookup/CallSiteKind';
import { ResultCache } from '@/service-lookup/ResultCache';
import { ServiceCallSite } from '@/service-lookup/ServiceCallSite';
import { Ctor, Type } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ConstructorCallSite.cs,312901d8ccc89353,references
export class CtorCallSite extends ServiceCallSite {
	readonly kind = CallSiteKind.Ctor;

	constructor(
		cache: ResultCache,
		readonly serviceType: Type,
		readonly implCtor: Ctor<object>,
		readonly parameterCallSites: ServiceCallSite[] = [],
	) {
		super(cache);
	}
}
