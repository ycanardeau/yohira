import { RoutePattern } from '../patterns/RoutePattern';
import { RoutePatternParameterPart } from '../patterns/RoutePatternParameterPart';
import { RoutePatternPathSegment } from '../patterns/RoutePatternPathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Template/RoutePrecedence.cs,6c17e5902dd4be3c,references
export function computeInboundPrecedenceDigit(
	routePattern: RoutePattern,
	pathSegment: RoutePatternPathSegment,
): number {
	if (pathSegment.parts.length > 1) {
		// Multi-part segments should appear after literal segments and along with parameter segments
		return 2;
	}

	const part = pathSegment.parts[0];
	// Literal segments always go first
	if (part.isLiteral) {
		return 1;
	} else if (part instanceof RoutePatternParameterPart) {
		// Parameter with a required value is matched as a literal
		// TODO

		const digit = part.isCatchAll ? 5 : 3;

		// If there is a route constraint for the parameter, reduce order by 1
		// Constrained parameters end up with order 2, Constrained catch alls end up with order 4
		// TODO

		return digit;
	} else {
		// Unreachable
		throw new Error('Specified method is not supported.' /* LOC */);
	}
}
