import { Type } from '@yohira/base/Type';
import { CallSiteKind } from '@yohira/extensions.dependency-injection/service-lookup/CallSiteKind';
import { ResultCache } from '@yohira/extensions.dependency-injection/service-lookup/ResultCache';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceCallSite.cs,34b408f4c5680498,references
export abstract class ServiceCallSite {
	protected constructor(readonly cache: ResultCache) {}

	abstract get serviceType(): Type;
	// TODO: implType
	abstract get kind(): CallSiteKind;
	value?: object;
}
