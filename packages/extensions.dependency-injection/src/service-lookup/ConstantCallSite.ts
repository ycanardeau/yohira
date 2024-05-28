import { CallSiteKind } from './CallSiteKind';
import { ResultCache } from './ResultCache';
import { ServiceCallSite } from './ServiceCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ConstantCallSite.cs,f9d9178a8d5d488f,references
export class ConstantCallSite extends ServiceCallSite {
	readonly kind = CallSiteKind.Constant;

	constructor(
		readonly serviceType: symbol,
		readonly defaultValue: object | undefined,
	) {
		super(ResultCache.none);

		this.value = defaultValue;
	}
}
