import { ResultCache } from '@yohira/extensions.dependency-injection/service-lookup/ResultCache';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceCallSite.cs,34b408f4c5680498,references
export abstract class ServiceCallSite {
	protected constructor(readonly cache: ResultCache) {}
}
