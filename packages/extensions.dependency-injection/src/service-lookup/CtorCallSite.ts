import { Type } from '@yohira/base/Type';
import { ResultCache } from '@yohira/extensions.dependency-injection/service-lookup/ResultCache';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ConstructorCallSite.cs,312901d8ccc89353,references
export class CtorCallSite extends ServiceCallSite {
	constructor(
		cache: ResultCache,
		serviceType: Type,
		/* TODO: ctorInfo */
		parameterCallSites: ServiceCallSite[] = [],
	) {
		super(cache);
	}
}
