import { CallSiteKind } from './CallSiteKind';
import { ResultCache } from './ResultCache';
import { ServiceCallSite } from './ServiceCallSite';

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
