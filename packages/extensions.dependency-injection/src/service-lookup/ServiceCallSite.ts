import { CallSiteKind } from './CallSiteKind';
import { ResultCache } from './ResultCache';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceCallSite.cs,34b408f4c5680498,references
export abstract class ServiceCallSite {
	protected constructor(readonly cache: ResultCache) {}

	abstract get serviceType(): symbol;
	// TODO: implType
	abstract get kind(): CallSiteKind;
	value: object | undefined;
}
