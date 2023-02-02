import { CallSiteKind } from './CallSiteKind';
import { ResultCache } from './ResultCache';
import { ServiceCallSite } from './ServiceCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceProviderCallSite.cs,de2401c973403090,references
export class ServiceProviderCallSite extends ServiceCallSite {
	constructor() {
		super(ResultCache.none);
	}

	readonly serviceType = Symbol.for('IServiceProvider');

	readonly kind = CallSiteKind.ServiceProvider;
}
