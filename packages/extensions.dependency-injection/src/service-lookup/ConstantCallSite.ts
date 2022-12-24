import { Type } from '@yohira/base/Type';
import { CallSiteKind } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteKind';
import { ResultCache } from '@yohira/extensions.dependency-injection/service-lookup/ResultCache';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ConstantCallSite.cs,f9d9178a8d5d488f,references
export class ConstantCallSite extends ServiceCallSite {
	readonly kind = CallSiteKind.Constant;

	constructor(
		readonly serviceType: Type,
		readonly defaultValue: object | undefined,
	) {
		super(ResultCache.none);

		this.value = defaultValue;
	}
}
