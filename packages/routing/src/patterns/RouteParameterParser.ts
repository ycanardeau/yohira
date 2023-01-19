import { RoutePatternParameterKind } from './RoutePatternParameterKind';
import { RoutePatternParameterPart } from './RoutePatternParameterPart';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RouteParameterParser.cs,387ae53bc3ae97d5,references
export function parseRouteParameter(
	parameter: string,
): RoutePatternParameterPart {
	if (parameter.length === 0) {
		return new RoutePatternParameterPart(
			'',
			RoutePatternParameterKind.Standard,
		);
	}

	let startIndex = 0;
	let endIndex = parameter.length - 1;
	let encodeSlashes = true;

	let parameterKind = RoutePatternParameterKind.Standard;

	if (parameter.startsWith('**')) {
		encodeSlashes = false;
		parameterKind = RoutePatternParameterKind.CatchAll;
		startIndex += 2;
	} else if (parameter[0] === '*') {
		parameterKind = RoutePatternParameterKind.CatchAll;
		startIndex++;
	}

	if (parameter[endIndex] === '?') {
		parameterKind = RoutePatternParameterKind.Optional;
		endIndex--;
	}

	let currentIndex = startIndex;

	// Parse parameter name
	let parameterName = '';

	while (currentIndex <= endIndex) {
		const currentChar = parameter[currentIndex];

		if (
			(currentChar === ':' || currentChar === '=') &&
			startIndex !== currentIndex
		) {
			// Parameter names are allowed to start with delimiters used to denote constraints or default values.
			// i.e. "=foo" or ":bar" would be treated as parameter names rather than default value or constraint
			// specifications.
			parameterName = parameter.substring(startIndex, currentIndex);

			// Roll the index back and move to the constraint parsing stage.
			currentIndex--;
			break;
		} else if (currentIndex === endIndex) {
			parameterName = parameter.substring(startIndex, currentIndex + 1);
		}

		currentIndex++;
	}

	// TODO

	return new RoutePatternParameterPart(
		parameterName,
		// TODO: defaultValue,
		parameterKind,
		// TODO: parameterPolicies,
		encodeSlashes,
	);
}
