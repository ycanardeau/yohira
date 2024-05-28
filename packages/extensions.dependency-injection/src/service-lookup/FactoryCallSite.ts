import { IServiceProvider } from '@yohira/base';

import { CallSiteKind } from './CallSiteKind';
import { ResultCache } from './ResultCache';
import { ServiceCallSite } from './ServiceCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/FactoryCallSite.cs,07787b7d1aa520f0,references
export class FactoryCallSite extends ServiceCallSite {
	readonly kind = CallSiteKind.Factory;

	constructor(
		cache: ResultCache,
		readonly serviceType: symbol,
		readonly factory: (serviceProvider: IServiceProvider) => object,
	) {
		super(cache);
	}
}
