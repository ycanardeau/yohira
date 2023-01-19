import {
	RoutePattern,
	RoutePatternLiteralPart,
	RoutePatternParameterKind,
	RoutePatternParameterPart,
	RoutePatternPart,
	RoutePatternSeparatorPart,
	createLiteralPart,
	createParameterPart,
	createPattern,
	createSegment,
	createSeparatorPart,
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

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L30
test('Parse_SingleParameter', () => {
	const template = '{p}';

	const expected = createPattern(template, [
		createSegment(createParameterPart('p')),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L45
test('Parse_OptionalParameter', () => {
	const template = '{p?}';

	const expected = createPattern(template, [
		createSegment(
			createParameterPart(
				'p',
				// TODO: undefined,
				RoutePatternParameterKind.Optional,
			),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L60
test('Parse_MultipleLiterals', () => {
	const template = 'cool/awesome/super';

	const expected = createPattern(template, [
		createSegment(createLiteralPart('cool')),
		createSegment(createLiteralPart('awesome')),
		createSegment(createLiteralPart('super')),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L79
test('Parse_MultipleParameters', () => {
	const template = '{p1}/{p2}/{*p3}';

	const expected = createPattern(template, [
		createSegment(createParameterPart('p1')),
		createSegment(createParameterPart('p2')),
		createSegment(
			createParameterPart(
				'p3',
				// TODO: undefined,
				RoutePatternParameterKind.CatchAll,
			),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L98
test('Parse_ComplexSegment_LP', () => {
	const template = 'cool-{p1}';

	const expected = createPattern(template, [
		createSegment(createLiteralPart('cool-'), createParameterPart('p1')),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L117
test('Parse_ComplexSegment_PL', () => {
	const template = '{p1}-cool';

	const expected = createPattern(template, [
		createSegment(createParameterPart('p1'), createLiteralPart('-cool')),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L136
test('Parse_ComplexSegment_PLP', () => {
	const template = '{p1}-cool-{p2}';

	const expected = createPattern(template, [
		createSegment(
			createParameterPart('p1'),
			createLiteralPart('-cool-'),
			createParameterPart('p2'),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L156
test('Parse_ComplexSegment_LPL', () => {
	const template = 'cool-{p1}-awesome';

	const expected = createPattern(template, [
		createSegment(
			createLiteralPart('cool-'),
			createParameterPart('p1'),
			createLiteralPart('-awesome'),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L176
test('Parse_ComplexSegment_OptionalParameterFollowingPeriod', () => {
	const template = '{p1}.{p2?}';

	const expected = createPattern(template, [
		createSegment(
			createParameterPart('p1'),
			createSeparatorPart('.'),
			createParameterPart(
				'p2',
				// TODO: undefined,
				RoutePatternParameterKind.Optional,
			),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L196
test('Parse_ComplexSegment_ParametersFollowingPeriod', () => {
	const template = '{p1}.{p2}';

	const expected = createPattern(template, [
		createSegment(
			createParameterPart('p1'),
			createLiteralPart('.'),
			createParameterPart('p2'),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L216
test('Parse_ComplexSegment_OptionalParameterFollowingPeriod_ThreeParameters', () => {
	const template = '{p1}.{p2}.{p3?}';

	const expected = createPattern(template, [
		createSegment(
			createParameterPart('p1'),
			createLiteralPart('.'),
			createParameterPart('p2'),
			createSeparatorPart('.'),
			createParameterPart(
				'p3',
				// TODO: undefined,
				RoutePatternParameterKind.Optional,
			),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L238
test('Parse_ComplexSegment_ThreeParametersSeparatedByPeriod', () => {
	const template = '{p1}.{p2}.{p3}';

	const expected = createPattern(template, [
		createSegment(
			createParameterPart('p1'),
			createLiteralPart('.'),
			createParameterPart('p2'),
			createLiteralPart('.'),
			createParameterPart('p3'),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L260
test('Parse_ComplexSegment_OptionalParameterFollowingPeriod_MiddleSegment', () => {
	const template = '{p1}.{p2?}/{p3}';

	const expected = createPattern(template, [
		createSegment(
			createParameterPart('p1'),
			createSeparatorPart('.'),
			createParameterPart(
				'p2',
				// TODO: undefined,
				RoutePatternParameterKind.Optional,
			),
		),
		createSegment(createParameterPart('p3')),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L282
test('Parse_ComplexSegment_OptionalParameterFollowingPeriod_LastSegment', () => {
	const template = '{p1}/{p2}.{p3?}';

	const expected = createPattern(template, [
		createSegment(createParameterPart('p1')),
		createSegment(
			createParameterPart('p2'),
			createSeparatorPart('.'),
			createParameterPart(
				'p3',
				// TODO: undefined,
				RoutePatternParameterKind.Optional,
			),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L304
test('Parse_ComplexSegment_OptionalParameterFollowingPeriod_PeriodAfterSlash', () => {
	const template = '{p2}/.{p3?}';

	const expected = createPattern(template, [
		createSegment(createParameterPart('p2')),
		createSegment(
			createSeparatorPart('.'),
			createParameterPart(
				'p3',
				// TODO: undefined,
				RoutePatternParameterKind.Optional,
			),
		),
	]);

	const actual = parseRoutePattern(template);

	expect(RoutePatternEquals(expected, actual)).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L329
test('Parse_RegularExpressions', () => {
	function Parse_RegularExpressions(
		template: string,
		constraint: string,
	): void {
		const expected = createPattern(template, [
			createSegment(
				createParameterPart(
					'p1',
					// TODO: undefined,
					RoutePatternParameterKind.Standard,
					// TODO: createConstraint(constraint),
				),
			),
		]);

		const actual = parseRoutePattern(template);

		expect(RoutePatternEquals(expected, actual)).toBe(true);
	}

	Parse_RegularExpressions(
		'{p1:regex(^\\d{{3}}-\\d{{3}}-\\d{{4}}$)}',
		'regex(^\\d{3}-\\d{3}-\\d{4}$)',
	); // ssn
	Parse_RegularExpressions(
		'{p1:regex(^\\d{{1,2}}/\\d{{1,2}}/\\d{{4}}$)}',
		'regex(^\\d{1,2}/\\d{1,2}/\\d{4}$)',
	); // date
	Parse_RegularExpressions(
		'{p1:regex(^\\w+\\@w+\\.\\w+)}',
		'regex(^\\w+\\@\\w+\\.\\w+)',
	); // email
	Parse_RegularExpressions('{p1:regex(([}}])\\w+)}', 'regex(([}])\\w+)'); // Not balanced }
	Parse_RegularExpressions('{p1:regex(([{{(])\\w+)}', 'regex(([{(])\\w+)'); // Not balanced {
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L355
test('Parse_RegularExpressions_Invalid', () => {
	function Parse_RegularExpressions_Invalid(template: string): void {
		expect(() => parseRoutePattern(template)).toThrowError(
			"There is an incomplete parameter in the route template. Check that each '{' character has a matching " +
				"'}' character.",
		);
	}

	Parse_RegularExpressions_Invalid(
		'{p1:regex(^\\d{{3}}-\\d{{3}}-\\d{{4}}}$)}',
	); // extra }
	Parse_RegularExpressions_Invalid(
		'{p1:regex(^\\d{{3}}-\\d{{3}}-\\d{{4}}$)}}',
	); // extra } at the end
	Parse_RegularExpressions_Invalid(
		'{{p1:regex(^\\d{{3}}-\\d{{3}}-\\d{{4}}$)}',
	); // extra { at the beginning
	Parse_RegularExpressions_Invalid('{p1:regex(([}])\\w+}'); // Not escaped }
	Parse_RegularExpressions_Invalid('{p1:regex(^\\d{{3}}-\\d{{3}}-\\d{{4}$)}'); // Not escaped }
	Parse_RegularExpressions_Invalid('{p1:regex(abc)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L367
test('Parse_RegularExpressions_Unescaped', () => {
	function Parse_RegularExpressions_Unescaped(template: string): void {
		expect(() => parseRoutePattern(template)).toThrowError(
			"In a route parameter, '{' and '}' must be escaped with '{{' and '}}'.",
		);
	}

	Parse_RegularExpressions_Unescaped(
		'{p1:regex(^\\d{{3}}-\\d{{3}}-\\d{{{4}}$)}',
	); // extra
	Parse_RegularExpressions_Unescaped(
		'{p1:regex(^\\d{{3}}-\\d{{3}}-\\d{4}}$)}',
	); // Not escaped
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L381
test('Parse_ComplexSegment_OptionalParameter_NotTheLastPart', () => {
	function Parse_ComplexSegment_OptionalParameter_NotTheLastPart(
		template: string,
		parameter: string,
		invalid: string,
	): void {
		expect(() => parseRoutePattern(template)).toThrowError(
			"An optional parameter must be at the end of the segment. In the segment '" +
				template +
				"', optional parameter '" +
				parameter +
				"' is followed by '" +
				invalid +
				"'.",
		);
	}

	Parse_ComplexSegment_OptionalParameter_NotTheLastPart(
		'{p1}.{p2?}.{p3}',
		'p2',
		'.',
	);
	Parse_ComplexSegment_OptionalParameter_NotTheLastPart(
		'{p1?}{p2}',
		'p1',
		'{p2}',
	);
	Parse_ComplexSegment_OptionalParameter_NotTheLastPart(
		'{p1?}{p2?}',
		'p1',
		'{p2?}',
	);
	Parse_ComplexSegment_OptionalParameter_NotTheLastPart(
		'{p1}.{p2?})',
		'p2',
		')',
	);
	Parse_ComplexSegment_OptionalParameter_NotTheLastPart(
		'{foorb?}-bar-{z}',
		'foorb',
		'-bar-',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L399
test('Parse_ComplexSegment_OptionalParametersSeparatedByPeriod_Invalid', () => {
	function Parse_ComplexSegment_OptionalParametersSeparatedByPeriod_Invalid(
		template: string,
		parameter: string,
	): void {
		expect(() => parseRoutePattern(template)).toThrowError(
			"In the segment '" +
				template +
				"', the optional parameter 'p2' is preceded by an invalid " +
				"segment '" +
				parameter +
				"'. Only a period (.) can precede an optional parameter.",
		);
	}

	Parse_ComplexSegment_OptionalParametersSeparatedByPeriod_Invalid(
		'{p1}-{p2?}',
		'-',
	);
	Parse_ComplexSegment_OptionalParametersSeparatedByPeriod_Invalid(
		'{p1}..{p2?}',
		'..',
	);
	Parse_ComplexSegment_OptionalParametersSeparatedByPeriod_Invalid(
		'..{p2?}',
		'..',
	);
	Parse_ComplexSegment_OptionalParametersSeparatedByPeriod_Invalid(
		'{p1}.abc.{p2?}',
		'.abc.',
	);
	Parse_ComplexSegment_OptionalParametersSeparatedByPeriod_Invalid(
		'{p1}{p2?}',
		'{p1}',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L409
test('InvalidTemplate_WithRepeatedParameter', () => {
	expect(() =>
		parseRoutePattern('{Controller}.mvc/{id}/{controller}'),
	).toThrowError(
		"The route parameter name 'controller' appears more than one time in the route template.",
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L423
test('InvalidTemplate_WithMismatchedBraces', () => {
	function InvalidTemplate_WithMismatchedBraces(template: string): void {
		expect(() => parseRoutePattern(template)).toThrowError(
			"There is an incomplete parameter in the route template. Check that each '{' character has a " +
				"matching '}' character.",
		);
	}

	InvalidTemplate_WithMismatchedBraces('123{a}abc{');
	InvalidTemplate_WithMismatchedBraces('123{a}abc}');
	InvalidTemplate_WithMismatchedBraces('xyz}123{a}abc}');
	InvalidTemplate_WithMismatchedBraces('{{p1}');
	InvalidTemplate_WithMismatchedBraces('{p1}}');
	InvalidTemplate_WithMismatchedBraces('p1}}p2{');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L432
test('InvalidTemplate_CannotHaveCatchAllInMultiSegment', () => {
	expect(() => parseRoutePattern('123{a}abc{*moo}')).toThrowError(
		'A path segment that contains more than one section, such as a literal section or a parameter, ' +
			'cannot contain a catch-all parameter.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L441
test('InvalidTemplate_CannotHaveMoreThanOneCatchAll', () => {
	expect(() => parseRoutePattern('{*p1}/{*p2}')).toThrowError(
		'A catch-all parameter can only appear as the last segment of the route template.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L449
test('InvalidTemplate_CannotHaveMoreThanOneCatchAllInMultiSegment', () => {
	expect(() => parseRoutePattern('{*p1}abc{*p2}')).toThrowError(
		'A path segment that contains more than one section, such as a literal section or a parameter, ' +
			'cannot contain a catch-all parameter.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L458
test('InvalidTemplate_CannotHaveCatchAllWithNoName', () => {
	expect(() => parseRoutePattern('"foo/{*}')).toThrowError(
		"The route parameter name '' is invalid. Route parameter names must be non-empty and cannot" +
			" contain these characters: '{', '}', '/'. The '?' character marks a parameter as optional," +
			" and can occur only at the end of the parameter. The '*' character marks a parameter as catch-all," +
			' and can occur only at the start of the parameter.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L478
test('ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters', () => {
	function ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		template: string,
		parameterName: string,
	): void {
		const expectedMessage =
			"The route parameter name '" +
			parameterName +
			"' is invalid. Route parameter " +
			"names must be non-empty and cannot contain these characters: '{', '}', '/'. The '?' character " +
			"marks a parameter as optional, and can occur only at the end of the parameter. The '*' character " +
			'marks a parameter as catch-all, and can occur only at the start of the parameter.';

		expect(() => parseRoutePattern(template)).toThrowError(expectedMessage);
	}

	ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		'{a*}',
		'a*',
	);
	ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		'{*a*}',
		'a*',
	);
	ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		'{*a*:int}',
		'a*',
	);
	ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		'{*a*=5}',
		'a*',
	);
	ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		'{*a*b=5}',
		'a*b',
	);
	ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		'{p1?}.{p2/}/{p3}',
		'p2/',
	);
	ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		'{p{{}',
		'p{',
	);
	ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		'{p}}}',
		'p}',
	);
	ParseRouteParameter_ThrowsIf_ParameterContainsSpecialCharacters(
		'{p/}',
		'p/',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L493
test('InvalidTemplate_CannotHaveConsecutiveOpenBrace', () => {
	expect(() => parseRoutePattern('foo/{{p1}')).toThrowError(
		"There is an incomplete parameter in the route template. Check that each '{' character has a " +
			"matching '}' character.",
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L502
test('InvalidTemplate_CannotHaveConsecutiveCloseBrace', () => {
	expect(() => parseRoutePattern('foo/{p1}}')).toThrowError(
		"There is an incomplete parameter in the route template. Check that each '{' character has a " +
			"matching '}' character.",
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L511
test('InvalidTemplate_SameParameterTwiceThrows', () => {
	expect(() => parseRoutePattern('{aaa}/{AAA}')).toThrowError(
		"The route parameter name 'AAA' appears more than one time in the route template.",
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L519
test('InvalidTemplate_SameParameterTwiceAndOneCatchAllThrows', () => {
	expect(() => parseRoutePattern('{aaa}/{*AAA}')).toThrowError(
		"The route parameter name 'AAA' appears more than one time in the route template.",
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L527
test('InvalidTemplate_InvalidParameterNameWithCloseBracketThrows', () => {
	expect(() => parseRoutePattern('{a}/{aa}a}/{z}')).toThrowError(
		"There is an incomplete parameter in the route template. Check that each '{' character has a " +
			"matching '}' character.",
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L536
test('InvalidTemplate_InvalidParameterNameWithOpenBracketThrows', () => {
	expect(() => parseRoutePattern('{a}/{a{aa}/{z}')).toThrowError(
		"In a route parameter, '{' and '}' must be escaped with '{{' and '}}'.",
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L544
test('InvalidTemplate_InvalidParameterNameWithEmptyNameThrows', () => {
	expect(() => parseRoutePattern('{a}/{}/{z}')).toThrowError(
		"The route parameter name '' is invalid. Route parameter names must be non-empty and cannot" +
			" contain these characters: '{', '}', '/'. The '?' character marks a parameter as optional, and" +
			" can occur only at the end of the parameter. The '*' character marks a parameter as catch-all," +
			' and can occur only at the start of the parameter.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L555
test('InvalidTemplate_InvalidParameterNameWithQuestionThrows', () => {
	expect(() => parseRoutePattern('{Controller}.mvc/{?}')).toThrowError(
		"The route parameter name '' is invalid. Route parameter names must be non-empty and cannot" +
			" contain these characters: '{', '}', '/'. The '?' character marks a parameter as optional, and" +
			" can occur only at the end of the parameter. The '*' character marks a parameter as catch-all," +
			' and can occur only at the start of the parameter.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L566
test('InvalidTemplate_ConsecutiveSeparatorsSlashSlashThrows', () => {
	expect(() => parseRoutePattern('{a}//{z}')).toThrowError(
		"The route template separator character '/' cannot appear consecutively. It must be separated by " +
			'either a parameter or a literal value.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L575
test('InvalidTemplate_WithCatchAllNotAtTheEndThrows', () => {
	expect(() => parseRoutePattern('foo/{p1}/{*p2}/{p3}')).toThrowError(
		'A catch-all parameter can only appear as the last segment of the route template.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L583
test('InvalidTemplate_RepeatedParametersThrows', () => {
	expect(() => parseRoutePattern('foo/aa{p1}{p2}')).toThrowError(
		"A path segment cannot contain two consecutive parameters. They must be separated by a '/' or by " +
			'a literal string.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L594
test('ValidTemplate_CanStartWithSlashOrTildeSlash', () => {
	function ValidTemplate_CanStartWithSlashOrTildeSlash(
		routePattern: string,
	): void {
		const pattern = parseRoutePattern(routePattern);

		expect(pattern.rawText).toBe(routePattern);
	}

	ValidTemplate_CanStartWithSlashOrTildeSlash('/foo');
	ValidTemplate_CanStartWithSlashOrTildeSlash('~/foo');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L604
test('InvalidTemplate_CannotStartWithTilde', () => {
	expect(() => parseRoutePattern('~foo')).toThrowError(
		"The route template cannot start with a '~' character unless followed by a '/'.",
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L612
test('InvalidTemplate_CannotContainQuestionMark', () => {
	expect(() => parseRoutePattern('foor?bar')).toThrowError(
		"The literal section 'foor?bar' is invalid. Literal sections cannot contain the '?' character.",
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L620
test('InvalidTemplate_ParameterCannotContainQuestionMark_UnlessAtEnd', () => {
	expect(() => parseRoutePattern('{foor?b}')).toThrowError(
		"The route parameter name 'foor?b' is invalid. Route parameter names must be non-empty and cannot" +
			" contain these characters: '{', '}', '/'. The '?' character marks a parameter as optional, and" +
			" can occur only at the end of the parameter. The '*' character marks a parameter as catch-all," +
			' and can occur only at the start of the parameter.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/RoutePatternParserTest.cs#L631
test('InvalidTemplate_CatchAllMarkedOptional', () => {
	expect(() => parseRoutePattern('{a}/{*b?}')).toThrowError(
		'A catch-all parameter cannot be marked optional.',
	);
});
