import { CallSiteKind } from '@/service-lookup/CallSiteKind';
import { ResultCache } from '@/service-lookup/ResultCache';
import { ServiceCallSite } from '@/service-lookup/ServiceCallSite';
import { Type } from '@yohira/base';

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
