import { IServiceProvider } from '@yohira/base/IServiceProvider';
import { Type } from '@yohira/base/Type';
import { CallSiteKind } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteKind';
import { ResultCache } from '@yohira/extensions.dependency-injection/service-lookup/ResultCache';
import { ServiceCallSite } from '@yohira/extensions.dependency-injection/service-lookup/ServiceCallSite';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/FactoryCallSite.cs,07787b7d1aa520f0,references
export class FactoryCallSite extends ServiceCallSite {
	readonly kind = CallSiteKind.Factory;

	constructor(
		cache: ResultCache,
		readonly serviceType: Type,
		readonly factory: (serviceProvider: IServiceProvider) => object,
	) {
		super(cache);
	}
}
