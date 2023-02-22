import { computeInbound } from '../template/RoutePrecedence';
import { RoutePatternParameterPart } from './RoutePatternParameterPart';
import { RoutePatternPathSegment } from './RoutePatternPathSegment';

const separatorString = '/';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePattern.cs,5f437021e7826e12,references
export class RoutePattern {
	readonly inboundPrecedence: number;

	constructor(
		readonly rawText: string | undefined,
		// TODO: defaults,
		// TODO: parameterPolicies,
		// TODO: requiredValues,
		readonly parameters: readonly RoutePatternParameterPart[],
		readonly pathSegments: readonly RoutePatternPathSegment[],
	) {
		this.inboundPrecedence = computeInbound(this);
	}

	debuggerToString(): string {
		return (
			this.rawText ??
			this.pathSegments
				.map((s) => s.debuggerToString())
				.join(separatorString)
		);
	}
}
