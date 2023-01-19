import {
	RoutePatternParameterKind,
	RoutePatternParameterPart,
	parseRouteParameter,
	parseRoutePattern,
} from '@yohira/routing';
import { expect, test } from 'vitest';

function parseParameter(routeParameter: string): RoutePatternParameterPart {
	const templatePart = parseRouteParameter(routeParameter);
	return templatePart;
}

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L11
test('ParseRouteParameter_WithoutADefaultValue', () => {
	function ParseRouteParameter_WithoutADefaultValue(
		parameterName: string,
	): void {
		const templatePart = parseParameter(parameterName);

		expect(templatePart.name).toBe(parameterName);
		// TODO: expect(templatePart.default).toBeUndefined();
		// TODO: expect(templatePart.parameterPolicies.length).toBe(0);
	}

	ParseRouteParameter_WithoutADefaultValue('=');
	ParseRouteParameter_WithoutADefaultValue(':');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L23
test('ParseRouteParameter_WithEmptyDefaultValue', () => {
	const templatePart = parseParameter('param=');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('')
	// TODO: expect(templatePart.parameterPolicies.length).toBe(0);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L35
test('ParseRouteParameter_WithoutAConstraintName', () => {
	const templatePart = parseParameter('param:');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBeUndefined()
	// TODO: expect(templatePart.parameterPolicies.length).toBe(0);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L47
test('ParseRouteParameter_WithoutAConstraintNameOrParameterName', () => {
	const templatePart = parseParameter('param:=');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('')
	// TODO: expect(templatePart.parameterPolicies.length).toBe(0);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L59
test('ParseRouteParameter_WithADefaultValueContainingConstraintSeparator', () => {
	const templatePart = parseParameter('param=:');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe(':')
	// TODO: expect(templatePart.parameterPolicies.length).toBe(0);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L71
test('ParseRouteParameter_ConstraintAndDefault_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:int=111111');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('111111')

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('int');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L85
test('ParseRouteParameter_ConstraintWithArgumentsAndDefault_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\d+)=111111');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('111111');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\d+)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L99
test('ParseRouteParameter_ConstraintAndOptional_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:int?');

	expect(templatePart.name).toBe('param');
	expect(templatePart.isOptional).toBe(true);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('int');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L113
test('ParseRouteParameter_ConstraintAndOptional_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:int=12?');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('12');
	expect(templatePart.isOptional).toBe(true);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('int');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L128
test('ParseRouteParameter_ConstraintAndOptional_WithDefaultValueWithQuestionMark_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:int=12??');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('12?')
	expect(templatePart.isOptional).toBe(true);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('int');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L143
test('ParseRouteParameter_ConstraintWithArgumentsAndOptional_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\d+)?');

	expect(templatePart.name).toBe('param');
	expect(templatePart.isOptional).toBe(true);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\d+)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L157
test('ParseRouteParameter_ConstraintWithArgumentsAndOptional_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\d+)=abc?');

	expect(templatePart.name).toBe('param');
	expect(templatePart.isOptional).toBe(true);

	// TODO: expect(templatePart.default).toBe('abc');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\d+)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L173
test('ParseRouteParameter_ChainedConstraints_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(d+):test(w+)');

	expect(templatePart.name).toBe('param');

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L187
test('ParseRouteParameter_ChainedConstraints_DoubleDelimiters_ParsedCorrectly', () => {
	const templatePart = parseParameter('param::test(d+)::test(w+)');

	expect(templatePart.name).toBe('param');

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L202
test('ParseRouteParameter_ChainedConstraints_ColonInPattern_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\d+):test(\\w:+)');

	expect(templatePart.name).toBe('param');

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L216
test('ParseRouteParameter_ChainedConstraints_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\d+):test(\\w+)=qwer');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.default).toBe('qwer')

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L232
test('ParseRouteParameter_ChainedConstraints_WithDefaultValue_DoubleDelimiters_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\d+)::test(\\w+)==qwer');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.default).toBe('=qwer');

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L252
test('ParseRouteParameter_WithDefaultValue_ContainingDelimiter', () => {
	function ParseRouteParameter_WithDefaultValue_ContainingDelimiter(
		defaultValue: string,
	): void {
		const templatePart = parseParameter(
			'comparison-operator:length(6)={defaultValue}',
		);

		expect(templatePart.name).toBe('comparison-operator');
		// TODO: expect(templatePart.default).toBe(defaultValue);

		// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
		// TODO: expect(templatePart.parameterPolicies[0]]).toBe('length(6)');
	}

	ParseRouteParameter_WithDefaultValue_ContainingDelimiter('=');
	ParseRouteParameter_WithDefaultValue_ContainingDelimiter('+=');
	ParseRouteParameter_WithDefaultValue_ContainingDelimiter('>= || <= || ==');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L266
test('ParseRouteTemplate_ConstraintsDefaultsAndOptionalsInMultipleSections_ParsedCorrectly', () => {
	const routePattern = parseRoutePattern(
		'some/url-{p1:int:test(3)=hello}/{p2=abc}/{p3?}',
	);

	const parameters = routePattern.parameters;

	const param1 = parameters[0];
	expect(param1.name).toBe('p1');
	// TODO: expect(param1.default).toBe('hello');
	expect(param1.isOptional).toBe(false);

	// TODO

	const param2 = parameters[1];
	expect(param2.name).toBe('p2');
	// TODO: expect(param2.default).toBe('abc');
	expect(param2.isOptional).toBe(false);

	const param3 = parameters[2];
	expect(param3.name).toBe('p3');
	expect(param3.isOptional).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L295
test('ParseRouteParameter_NoTokens_ParsedCorrectly', () => {
	const templatePart = parseParameter('world');

	expect(templatePart.name).toBe('world');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L305
test('ParseRouteParameter_ParamDefault_ParsedCorrectly', () => {
	const templatePart = parseParameter('param=world');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('world');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L316
test('ParseRouteParameter_ConstraintWithClosingBraceInPattern_ClosingBraceIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\})');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\})');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L329
test('ParseRouteParameter_ConstraintWithClosingBraceInPattern_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\})=wer');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.default).toBe('wer');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\})');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L344
test('ParseRouteParameter_ConstraintWithClosingParenInPattern_ClosingParenIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\))');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\))');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L357
test('ParseRouteParameter_ConstraintWithClosingParenInPattern_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\))=fsd');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.default).toBe('fsd');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\))');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L372
test('ParseRouteParameter_ConstraintWithColonInPattern_ColonIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(:)');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(:)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L385
test('ParseRouteParameter_ConstraintWithColonInPattern_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(:)=mnf');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.default).toBe('mnf')

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(:)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L400
test('ParseRouteParameter_ConstraintWithColonsInPattern_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(a:b:c)');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(a:b:c)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L413
test('ParseRouteParameter_ConstraintWithColonInParamName_ParsedCorrectly', () => {
	const templatePart = parseParameter(':param:test=12');

	expect(templatePart.name).toBe(':param');

	// TODO: expect(templatePart.default).toBe(12);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L428
test('ParseRouteParameter_ConstraintWithTwoColonInParamName_ParsedCorrectly', () => {
	const templatePart = parseParameter(':param::test=12');

	expect(templatePart.name, ':param');

	// TODO: expect(templatePart.default).toBe('12');

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L444
test('ParseRouteParameter_EmptyConstraint_ParsedCorrectly', () => {
	const templatePart = parseParameter(':param:test:');

	expect(templatePart.name).toBe(':param');

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L458
test('ParseRouteParameter_ConstraintWithCommaInPattern_PatternIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\w,\\w)');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\w,\\w)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L471
test('ParseRouteParameter_ConstraintWithCommaInName_ParsedCorrectly', () => {
	const templatePart = parseParameter('par,am:test(\\w)');

	expect(templatePart.name).toBe('par,am');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\w)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L484
test('ParseRouteParameter_ConstraintWithCommaInPattern_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\w,\\w)=jsd');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.default).toBe('jsd');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\w,\\w)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L499
test('ParseRouteParameter_ConstraintWithEqualsFollowedByQuestionMark_PatternIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:int=?');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('');

	expect(templatePart.isOptional).toBe(true);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('int');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L515
test('ParseRouteParameter_ConstraintWithEqualsSignInPattern_PatternIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(=)');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBeUndefined();

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(=)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L529
test('ParseRouteParameter_EqualsSignInDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param=test=bar');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('test=bar');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L540
test('ParseRouteParameter_ConstraintWithEqualEqualSignInPattern_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(a==b)');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBeUndefined();

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(a==b)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L554
test('ParseRouteParameter_ConstraintWithEqualEqualSignInPattern_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(a==b)=dvds');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBeUndefined();

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(a==b)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L568
test('ParseRouteParameter_EqualEqualSignInName_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('par==am:test=dvds');

	expect(templatePart.name).toBe('par');
	// TODO: expect(templatePart.default).toBe('=am:test=dvds');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L579
test('ParseRouteParameter_EqualEqualSignInDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test==dvds');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('=dvds');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L590
test('ParseRouteParameter_DefaultValueWithColonAndParens_ParsedCorrectly', () => {
	const templatePart = parseParameter('par=am:test(asd)');

	expect(templatePart.name).toBe('par');
	// TODO: expect(templatePart.default).toBe('am:test(asd)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L601
test('ParseRouteParameter_DefaultValueWithEqualsSignIn_ParsedCorrectly', () => {
	const templatePart = parseParameter('par=test(am):est=asd');

	expect(templatePart.name).toBe('par');
	// TODO: expect(templatePart.default).toBe('test(am):est=asd');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L612
test('ParseRouteParameter_ConstraintWithEqualsSignInPattern_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(=)=sds');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('sds');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(=)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L626
test('ParseRouteParameter_ConstraintWithOpenBraceInPattern_PatternIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\{)');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\{)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L639
test('ParseRouteParameter_ConstraintWithOpenBraceInName_ParsedCorrectly', () => {
	const templatePart = parseParameter('par{am:test(\\sd)');

	expect(templatePart.name).toBe('par{am');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\sd)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L652
test('ParseRouteParameter_ConstraintWithOpenBraceInPattern_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\{)=xvc');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.default).toBe('xvc');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\{)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L667
test('ParseRouteParameter_ConstraintWithOpenParenInName_ParsedCorrectly', () => {
	const templatePart = parseParameter('par(am:test(\\()');

	expect(templatePart.name).toBe('par(am');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\()');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L680
test('ParseRouteParameter_ConstraintWithOpenParenInPattern_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\()');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\()');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L693
test('ParseRouteParameter_ConstraintWithOpenParenNoCloseParen_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(#$%');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(#$%');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L706
test('ParseRouteParameter_ConstraintWithOpenParenAndColon_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(#:test1');

	expect(templatePart.name).toBe('param');

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L720
test('ParseRouteParameter_ConstraintWithOpenParenAndColonWithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter(
		'param:test(abc:somevalue):name(test1:differentname=default-value',
	);

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('default-value')

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L736
test('ParseRouteParameter_ConstraintWithOpenParenAndDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(constraintvalue=test1');

	expect(templatePart.name, 'param');
	// TODO: expect(templatePart.default).toBe('test1');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(constraintvalue');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L750
test('ParseRouteParameter_ConstraintWithOpenParenInPattern_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\()=djk');

	expect(templatePart.name).toBe('param');

	// TODO: expect(templatePart.default).toBe('djk');

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\()');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L765
test('ParseRouteParameter_ConstraintWithQuestionMarkInPattern_PatternIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\?)');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBeUndefined();
	expect(templatePart.isOptional).toBe(false);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\?)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L780
test('ParseRouteParameter_ConstraintWithQuestionMarkInPattern_Optional_PatternIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\?)?');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBeUndefined();
	expect(templatePart.isOptional).toBe(true);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\?)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L795
test('ParseRouteParameter_ConstraintWithQuestionMarkInPattern_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\?)=sdf');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('sdf');
	expect(templatePart.isOptional).toBe(false);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\?)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L810
test('ParseRouteParameter_ConstraintWithQuestionMarkInPattern_Optional_WithDefaultValue_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(\\?)=sdf?');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBe('sdf');
	expect(templatePart.isOptional).toBe(true);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\?)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L825
test('ParseRouteParameter_ConstraintWithQuestionMarkInName_ParsedCorrectly', () => {
	const templatePart = parseParameter('par?am:test(\\?)');

	expect(templatePart.name).toBe('par?am');
	// TODO: expect(templatePart.default).toBeUndefined();
	expect(templatePart.isOptional).toBe(false);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(\\?)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L840
test('ParseRouteParameter_ConstraintWithClosedParenAndColonInPattern_ParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(#):$)');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBeUndefined();
	expect(templatePart.isOptional).toBe(false);

	// TODO
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L856
test('ParseRouteParameter_ConstraintWithColonAndClosedParenInPattern_PatternIsParsedCorrectly', () => {
	const templatePart = parseParameter('param:test(#:)$)');

	expect(templatePart.name).toBe('param');
	// TODO: expect(templatePart.default).toBeUndefined();
	expect(templatePart.isOptional).toBe(false);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('test(#:)$)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L871
test('ParseRouteParameter_ContainingMultipleUnclosedParenthesisInConstraint', () => {
	const templatePart = parseParameter('foo:regex(\\\\(\\\\(\\\\(\\\\()');

	expect(templatePart.name).toBe('foo');
	// TODO: expect(templatePart.default).toBeUndefined();
	expect(templatePart.isOptional).toBe(false);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('regex(\\\\(\\\\(\\\\(\\\\()');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L886
test('ParseRouteParameter_ConstraintWithBraces_PatternIsParsedCorrectly', () => {
	const templatePart = parseParameter(
		'p1:regex(^\\d{{3}}-\\d{{3}}-\\d{{4}}$)',
	);

	expect(templatePart.name).toBe('p1');
	// TODO: expect(templatePart.default).toBeUndefined();
	expect(templatePart.isOptional).toBe(false);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('regex(^\\d{{3}}-\\d{{3}}-\\d{{4}}$)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L901
test('ParseRouteParameter_ConstraintWithBraces_WithDefaultValue', () => {
	const templatePart = parseParameter(
		'p1:regex(^\\d{{3}}-\\d{{3}}-\\d{{4}}$)=123-456-7890',
	);

	expect(templatePart.name).toBe('p1');
	// TODO: expect(templatePart.default).toBe('123-456-7890');
	expect(templatePart.isOptional).toBe(false);

	// TODO: expect(templatePart.parameterPolicies.length).toBe(1);
	// TODO: expect(templatePart.parameterPolicies[0]]).toBe('regex(^\\d{{3}}-\\d{{3}}-\\d{{4}}$)');
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L924
test('ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues', () => {
	function ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues(
		parameter: string,
		expectedParameterName: string,
	): void {
		const templatePart = parseParameter(parameter);

		expect(templatePart.name).toBe(expectedParameterName);
		// TODO: expect(templatePart.parameterPolicies.length).toBe(0);
		// TODO: expect(templatePart.default).toBeUndefined();
	}

	ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues(
		'',
		'',
	);
	ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues(
		'?',
		'',
	);
	ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues(
		'*',
		'',
	);
	ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues(
		'**',
		'',
	);
	ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues(
		' ',
		' ',
	);
	ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues(
		'\t',
		'\t',
	);
	ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues(
		'#!@#$%Q@#@%',
		'#!@#$%Q@#@%',
	);
	ParseRouteParameter_ParameterWithoutInlineConstraint_ReturnsTemplatePartWithEmptyInlineValues(
		',,,',
		',,,',
	);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L938
test('ParseRouteParameter_WithSingleAsteriskCatchAll_IsParsedCorrectly', () => {
	const parameterPart = parseParameter('*path');

	expect(parameterPart.name).toBe('path');
	expect(parameterPart.isCatchAll).toBe(true);
	expect(parameterPart.parameterKind).toBe(
		RoutePatternParameterKind.CatchAll,
	);
	expect(parameterPart.encodeSlashes).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L951
test('ParseRouteParameter_WithSingleAsteriskCatchAll_AndDefaultValue_IsParsedCorrectly', () => {
	const parameterPart = parseParameter('*path=a/b/c');

	expect(parameterPart.name).toBe('path');
	expect(parameterPart.isCatchAll).toBe(true);
	// TODO: expect(parameterPart.default).not.toBeUndefined();
	// TODO: expect(parameterPart.default.toString()).toBe('a/b/c');
	expect(parameterPart.parameterKind).toBe(
		RoutePatternParameterKind.CatchAll,
	);
	expect(parameterPart.encodeSlashes).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L966
test('ParseRouteParameter_WithSingleAsteriskCatchAll_AndConstraints_IsParsedCorrectly', () => {
	const constraintContent = 'regex(^(/[^/ ]*)+/?$)';

	const parameterPart = parseParameter(`*path:${constraintContent}`);

	expect(parameterPart.name).toBe('path');
	expect(parameterPart.isCatchAll).toBe(true);
	expect(parameterPart.parameterKind).toBe(
		RoutePatternParameterKind.CatchAll,
	);
	// TODO: expect(parameterPart.parameterPolicies.length).toBe(1);
	// TODO: expect(parameterPart.parameterPolicies[0].content).toBe(constraintContent);
	expect(parameterPart.encodeSlashes).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L984
test('ParseRouteParameter_WithSingleAsteriskCatchAll_AndConstraints_AndDefaultValue_IsParsedCorrectly', () => {
	const constraintContent = 'regex(^(/[^/ ]*)+/?$)';

	const parameterPart = parseParameter(`*path:${constraintContent}=a/b/c`);

	expect(parameterPart.name).toBe('path');
	expect(parameterPart.isCatchAll).toBe(true);
	expect(parameterPart.parameterKind).toBe(
		RoutePatternParameterKind.CatchAll,
	);
	// TODO: expect(parameterPart.parameterPolicies.length).toBe(1);
	// TODO: expect(parameterPart.parameterPolicies[0].content).toBe(constraintContent);
	// TODO: expect(parameterPart.default).not.toBeUndefined();
	// TODO: expect(parameterPart.default.toString()).toBe('a/b/c');
	expect(parameterPart.encodeSlashes).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L1004
test('ParseRouteParameter_WithDoubleAsteriskCatchAll_IsParsedCorrectly', () => {
	const parameterPart = parseParameter('**path');

	expect(parameterPart.name).toBe('path');
	expect(parameterPart.isCatchAll).toBe(true);
	expect(parameterPart.encodeSlashes).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L1016
test('ParseRouteParameter_WithDoubleAsteriskCatchAll_AndDefaultValue_IsParsedCorrectly', () => {
	const parameterPart = parseParameter('**path=a/b/c');

	expect(parameterPart.name).toBe('path');
	expect(parameterPart.isCatchAll).toBe(true);
	// TODO: expect(parameterPart.default).not.toBeUndefined();
	// TODO: expect(parameterPart.default.toString()).toBe('a/b/c');
	expect(parameterPart.encodeSlashes).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L1030
test('ParseRouteParameter_WithDoubleAsteriskCatchAll_AndConstraints_IsParsedCorrectly', () => {
	const constraintContent = 'regex(^(/[^/ ]*)+/?$)';

	const parameterPart = parseParameter(`**path:${constraintContent}`);

	expect(parameterPart.name).toBe('path');
	expect(parameterPart.isCatchAll).toBe(true);
	expect(parameterPart.encodeSlashes).toBe(false);
	// TODO: expect(parameterPart.parameterPolicies.length).toBe(1);
	// TODO: expect(parameterPart.parameterPolicies[0].content).toBe(constraintContent);
});

// https://github.com/dotnet/aspnetcore/blob/e5238763bddd7100823751c4a4ae0220d78160aa/src/Http/Routing/test/UnitTests/Patterns/InlineRouteParameterParserTest.cs#L1047
test('ParseRouteParameter_WithDoubleAsteriskCatchAll_AndConstraints_AndDefaultValue_IsParsedCorrectly', () => {
	const constraintContent = 'regex(^(/[^/ ]*)+/?$)';

	const parameterPart = parseParameter(`**path:${constraintContent}=a/b/c`);

	expect(parameterPart.name).toBe('path');
	expect(parameterPart.isCatchAll).toBe(true);
	expect(parameterPart.encodeSlashes).toBe(false);
	// TODO: expect(parameterPart.parameterPolicies.length).toBe(1);
	// TODO: expect(parameterPart.parameterPolicies[0].content).toBe(constraintContent);
	// TODO: expect(parameterPart.default).not.toBeUndefined();
	// TODO: expect(parameterPart.default.toString()).toBe('a/b/c');
});
