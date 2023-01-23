import { RoutePatternParameterPart } from './RoutePatternParameterPart';
import { RoutePatternPathSegment } from './RoutePatternPathSegment';

const separatorString = '/';

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

	debuggerToString(): string {
		return (
			this.rawText ??
			this.pathSegments
				.map((s) => s.debuggerToString())
				.join(separatorString)
		);
	}
}
