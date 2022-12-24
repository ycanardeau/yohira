import { Ctor, Type } from '@yohira/base/Type';
import { CallSiteKind } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteKind';
import { ResultCache } from '@yohira/extensions.dependency-injection/service-lookup/ResultCache';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';

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
