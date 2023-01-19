import {
	RoutePattern,
	RoutePatternLiteralPart,
	RoutePatternParameterPart,
	RoutePatternPart,
	RoutePatternSeparatorPart,
	createLiteralPart,
	createPattern,
	createSegment,
	parseRoutePattern,
} from '@yohira/routing';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L721
function RoutePatternLiteralPartEquals(
	x: RoutePatternLiteralPart,
	y: RoutePatternLiteralPart,
): boolean {
	return x.content === y.content;
}

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L726
function RoutePatternParameterPartEquals(
	x: RoutePatternParameterPart,
	y: RoutePatternParameterPart,
): boolean {
	return (
		x.name === y.name &&
		// TODO: x.default === y.default &&
		x.parameterKind === y.parameterKind
		// TODO: parameterPolicies
	);
}

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L743
function RoutePatternSeparatorPartEquals(
	x: RoutePatternSeparatorPart,
	y: RoutePatternSeparatorPart,
): boolean {
	return x.content === y.content;
}

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L697
function RoutePatternPartEquals(
	x: RoutePatternPart,
	y: RoutePatternPart,
): boolean {
	// REVIEW
	if (x.constructor.name !== y.constructor.name) {
		return false;
	}

	if (x.isLiteral && y.isLiteral) {
		return RoutePatternLiteralPartEquals(
			x as RoutePatternLiteralPart,
			y as RoutePatternLiteralPart,
		);
	} else if (x.isParameter && y.isParameter) {
		return RoutePatternParameterPartEquals(
			x as RoutePatternParameterPart,
			y as RoutePatternParameterPart,
		);
	} else if (x.isSeparator && y.isSeparator) {
		return RoutePatternSeparatorPartEquals(
			x as RoutePatternSeparatorPart,
			y as RoutePatternSeparatorPart,
		);
	}

	throw new Error(
		'This should not be reachable. Do you need to update the comparison logic?',
	);
}

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L642
function RoutePatternEquals(
	x: RoutePattern | undefined,
	y: RoutePattern | undefined,
): boolean {
	if (x === undefined && y === undefined) {
		return true;
	} else if (x === undefined || y === undefined) {
		return false;
	} else {
		if (x.rawText !== y.rawText) {
			return false;
		}

		if (x.pathSegments.length !== y.pathSegments.length) {
			return false;
		}

		for (let i = 0; i < x.pathSegments.length; i++) {
			if (
				x.pathSegments[i].parts.length !==
				y.pathSegments[i].parts.length
			) {
				return false;
			}

			for (let j = 0; j < x.pathSegments[i].parts.length; j++) {
				if (
					!RoutePatternPartEquals(
						x.pathSegments[i].parts[j],
						y.pathSegments[i].parts[j],
					)
				) {
					return false;
				}
			}
		}

		if (x.parameters.length !== y.parameters.length) {
			return false;
		}

		for (let i = 0; i < x.parameters.length; i++) {
			if (
				!RoutePatternParameterPartEquals(
					x.parameters[i],
					y.parameters[i],
				)
			) {
				return false;
			}
		}

		return true;
	}
}

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L13
test('Parse_SingleLiteral', () => {
	const template = 'cool';

	const expected = createPattern(template, [
		createSegment(createLiteralPart('cool')),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});
