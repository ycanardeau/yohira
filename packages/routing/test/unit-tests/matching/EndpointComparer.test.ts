import { typedef } from '@yohira/base';
import { EndpointMetadataCollection } from '@yohira/http.abstractions';
import {
	EndpointComparer,
	EndpointMetadataComparer,
	IEndpointComparerPolicy,
	RouteEndpoint,
	parseRoutePattern,
} from '@yohira/routing';
import { expect, test } from 'vitest';

import { emptyRequestDelegate } from '../TestConstants';

function createEndpoint(
	template: string,
	order: number,
	...metadata: object[]
): RouteEndpoint {
	return new RouteEndpoint(
		emptyRequestDelegate,
		parseRoutePattern(template),
		order,
		new EndpointMetadataCollection(metadata),
		`test: ${template}`,
	);
}

function createComparer(
	...policies: IEndpointComparerPolicy[]
): EndpointComparer {
	return new EndpointComparer(policies);
}

@typedef()
class TestMetadata1 {}

class TestMetadata1Policy implements IEndpointComparerPolicy {
	readonly comparer = EndpointMetadataComparer.getDefault<TestMetadata1>(
		Symbol.for('TestMetadata1'),
	);
}

@typedef()
class TestMetadata2 {}

class TestMetadata2Policy implements IEndpointComparerPolicy {
	readonly comparer = EndpointMetadataComparer.getDefault<TestMetadata2>(
		Symbol.for('TestMetadata2'),
	);
}

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L12
test('Compare_PrefersOrder_IfDifferent', () => {
	const endpoint1 = createEndpoint('/', 1);
	const endpoint2 = createEndpoint('/api/foo', -1);

	const comparer = createComparer();

	const result = comparer.compare(endpoint1, endpoint2);

	expect(result).toBe(1);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L28
test('Compare_PrefersPrecedence_IfOrderIsSame', () => {
	const endpoint1 = createEndpoint('/api/foo', 1);
	const endpoint2 = createEndpoint('/', 1);

	const comparer = createComparer();

	const result = comparer.compare(endpoint1, endpoint2);

	expect(result).toBe(1);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L44
test('Compare_PrefersPolicy_IfPrecedenceIsSame', () => {
	const endpoint1 = createEndpoint('/', 1, new TestMetadata1());
	const endpoint2 = createEndpoint('/', 1);

	const comparer = createComparer(new TestMetadata1Policy());

	const result = comparer.compare(endpoint1, endpoint2);

	expect(result).toBe(-1);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L60
test('Compare_PrefersSecondPolicy_IfFirstPolicyIsSame', () => {
	const endpoint1 = createEndpoint('/', 1, new TestMetadata1());
	const endpoint2 = createEndpoint(
		'/',
		1,
		new TestMetadata1(),
		new TestMetadata2(),
	);

	const comparer = createComparer(
		new TestMetadata1Policy(),
		new TestMetadata2Policy(),
	);

	const result = comparer.compare(endpoint1, endpoint2);

	expect(result).toBe(1);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L76
test('Compare_PrefersTemplate_IfOtherCriteriaIsSame', () => {
	const endpoint1 = createEndpoint('/foo', 1, new TestMetadata1());
	const endpoint2 = createEndpoint('/bar', 1, new TestMetadata1());

	const comparer = createComparer(
		new TestMetadata1Policy(),
		new TestMetadata2Policy(),
	);

	const result = comparer.compare(endpoint1, endpoint2);

	expect(result > 0).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L92
test('Compare_ReturnsZero_WhenIdentical', () => {
	const endpoint1 = createEndpoint('/foo', 1, new TestMetadata1());
	const endpoint2 = createEndpoint('/foo', 1, new TestMetadata1());

	const comparer = createComparer(
		new TestMetadata1Policy(),
		new TestMetadata2Policy(),
	);

	const result = comparer.compare(endpoint1, endpoint2);

	expect(result).toBe(0);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L108
test('Equals_NotEqual_IfOrderDifferent', () => {
	const endpoint1 = createEndpoint('/', 1);
	const endpoint2 = createEndpoint('/api/foo', -1);

	const comparer = createComparer();

	const result = comparer.equals(endpoint1, endpoint2);

	expect(result).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L124
test('Equals_NotEqual_IfPrecedenceDifferent', () => {
	const endpoint1 = createEndpoint('/api/foo', 1);
	const endpoint2 = createEndpoint('/', 1);

	const comparer = createComparer();

	const result = comparer.equals(endpoint1, endpoint2);

	expect(result).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L140
test('Equals_NotEqual_IfFirstPolicyDifferent', () => {
	const endpoint1 = createEndpoint('/', 1, new TestMetadata1());
	const endpoint2 = createEndpoint('/', 1);

	const comparer = createComparer(new TestMetadata1Policy());

	const result = comparer.equals(endpoint1, endpoint2);

	expect(result).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L156
test('Equals_NotEqual_IfSecondPolicyDifferent', () => {
	const endpoint1 = createEndpoint('/', 1, new TestMetadata1());
	const endpoint2 = createEndpoint(
		'/',
		1,
		new TestMetadata1(),
		new TestMetadata2(),
	);

	const comparer = createComparer(
		new TestMetadata1Policy(),
		new TestMetadata2Policy(),
	);

	const result = comparer.equals(endpoint1, endpoint2);

	expect(result).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L172
test('Equals_Equals_WhenTemplateIsDifferent', () => {
	const endpoint1 = createEndpoint('/foo', 1, new TestMetadata1());
	const endpoint2 = createEndpoint('/bar', 1, new TestMetadata1());

	const comparer = createComparer(
		new TestMetadata1Policy(),
		new TestMetadata2Policy(),
	);

	const result = comparer.equals(endpoint1, endpoint2);

	expect(result).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L188
test('Sort_MoreSpecific_FirstInList', () => {
	const endpoint1 = createEndpoint('/foo', -1);
	const endpoint2 = createEndpoint('/bar/{baz}', -1);
	const endpoint3 = createEndpoint('/bar', 0, new TestMetadata1());
	const endpoint4 = createEndpoint('/foo', 0, new TestMetadata2());
	const endpoint5 = createEndpoint('/foo', 0);
	const endpoint6 = createEndpoint(
		'/a{baz}',
		0,
		new TestMetadata1(),
		new TestMetadata2(),
	);
	const endpoint7 = createEndpoint(
		'/bar{baz}',
		0,
		new TestMetadata1(),
		new TestMetadata2(),
	);

	const list = [
		endpoint7,
		endpoint6,
		endpoint5,
		endpoint4,
		endpoint3,
		endpoint2,
		endpoint1,
	];

	const comparer = createComparer(
		new TestMetadata1Policy(),
		new TestMetadata2Policy(),
	);

	list.sort((x, y) => comparer.compare(x, y));

	expect(list[0]).toBe(endpoint1);
	expect(list[1]).toBe(endpoint2);
	expect(list[2]).toBe(endpoint3);
	expect(list[3]).toBe(endpoint4);
	expect(list[4]).toBe(endpoint5);
	expect(list[5]).toBe(endpoint6);
	expect(list[6]).toBe(endpoint7);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/EndpointComparerTest.cs#L220
test('Compare_PatternOrder_OrdinalIgnoreCaseSort', () => {
	const endpoint1 = createEndpoint('/I', 0);
	const endpoint2 = createEndpoint('/i', 0);
	const endpoint3 = createEndpoint('\u0131', 0); // Turkish lowercase i

	const list = [endpoint1, endpoint2, endpoint3];

	const comparer = createComparer();

	list.sort((x, y) => comparer.compare(x, y) /* TODO: bind this */);

	expect(list[0]).toBe(endpoint1);
	expect(list[1]).toBe(endpoint2);
	expect(list[2]).toBe(endpoint3);
});
