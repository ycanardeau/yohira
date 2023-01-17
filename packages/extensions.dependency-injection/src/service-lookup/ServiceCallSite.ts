import { Type } from '@yohira/base';

import { CallSiteKind } from '../service-lookup/CallSiteKind';
import { ResultCache } from '../service-lookup/ResultCache';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceCallSite.cs,34b408f4c5680498,references
export abstract class ServiceCallSite {
	protected constructor(readonly cache: ResultCache) {}

	abstract get serviceType(): Type;
	// TODO: implType
	abstract get kind(): CallSiteKind;
	value?: object;
}
