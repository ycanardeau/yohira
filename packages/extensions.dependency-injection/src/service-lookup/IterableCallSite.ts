import { CallSiteKind } from '../service-lookup/CallSiteKind';
import { ResultCache } from '../service-lookup/ResultCache';
import { ServiceCallSite } from '../service-lookup/ServiceCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/IEnumerableCallSite.cs,0efa94210b7ccd71,references
export class IterableCallSite extends ServiceCallSite {
	readonly kind = CallSiteKind.Iterable;

	constructor(
		cache: ResultCache,
		readonly itemType: symbol,
		readonly serviceCallSites: ServiceCallSite[],
	) {
		super(cache);
	}

	get serviceType(): symbol {
		// TODO
		throw new Error('Method not implemented.');
	}
}
