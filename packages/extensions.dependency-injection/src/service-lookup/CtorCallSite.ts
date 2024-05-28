import { Ctor } from '@yohira/base';

import { CallSiteKind } from './CallSiteKind';
import { ResultCache } from './ResultCache';
import { ServiceCallSite } from './ServiceCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ConstructorCallSite.cs,312901d8ccc89353,references
export class CtorCallSite extends ServiceCallSite {
	readonly kind = CallSiteKind.Ctor;

	constructor(
		cache: ResultCache,
		readonly serviceType: symbol,
		readonly implCtor: Ctor<object>,
		readonly parameterCallSites: ServiceCallSite[] = [],
	) {
		super(cache);
	}
}
