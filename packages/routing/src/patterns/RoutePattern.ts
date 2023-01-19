import { RoutePatternParameterPart } from './RoutePatternParameterPart';
import { RoutePatternPathSegment } from './RoutePatternPathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePattern.cs,5f437021e7826e12,references
export class RoutePattern {
	constructor(
		readonly rawText: string | undefined,
		// TODO: defaults,
		// TODO: parameterPolicies,
		// TODO: requiredValues,
		readonly parameters: readonly RoutePatternParameterPart[],
		readonly pathSegments: readonly RoutePatternPathSegment[],
	) {}
}
