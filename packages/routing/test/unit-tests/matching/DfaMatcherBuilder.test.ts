import { NullLoggerFactory } from '@yohira/extensions.logging.abstractions';
import {
	DfaMatcherBuilder,
	MatcherPolicy,
	RouteEndpoint,
} from '@yohira/routing';
import { expect, test } from 'vitest';

import { createRouteEndpoint } from '../EndpointFactory';

function createDfaMatcherBuilder(
	...policies: MatcherPolicy[]
): DfaMatcherBuilder {
	// TODO: const policyFactory = createParameterPolicyFactory();
	//const dataSource = new CompositeEndpointDataSource([]);
	return new DfaMatcherBuilder(
		NullLoggerFactory.instance,
		// TODO: policyFactory,
		{
			select(): Promise<void> {
				return Promise.resolve();
			},
		},
		policies,
	);
}

function createEndpoint(
	template: string,
	defaults?: object,
	constraints?: object,
	requiredValues?: object,
	order = 0,
	// TODO: ...metadata: object[]
): RouteEndpoint {
	return createRouteEndpoint(
		template,
		// TODO: defaults,
		// TODO: constraints,
		// TODO: requiredValues,
		order,
		// TODO: metadata,
	);
}

function single<T>(actual: Iterable<T> | undefined): T {
	expect(actual).not.toBeUndefined();
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const array = Array.from(actual!);
	expect(array.length).toBe(1);
	return array[0];
}

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L18
test('BuildDfaTree_SingleEndpoint_Empty', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint = createEndpoint('/');
	builder.addEndpoint(endpoint);

	const root = builder.buildDfaTree();

	expect(single(root.matches)).toBe(endpoint);
	expect(root.parameters).toBeUndefined();
	expect(root.literals).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L36
test('BuildDfaTree_SingleEndpoint_Literals', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint = createEndpoint('a/b/c');
	builder.addEndpoint(endpoint);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).toBeUndefined();

	let next = single(root.literals);
	expect(next[0]).toBe('a');

	const a = next[1];
	expect(a.matches).toBeUndefined();
	expect(a.parameters).toBeUndefined();

	next = single(a.literals);
	expect(next[0]).toBe('b');

	const b = next[1];
	expect(b.matches).toBeUndefined();
	expect(b.parameters).toBeUndefined();

	next = single(b.literals);
	expect(next[0]).toBe('c');

	const c = next[1];
	expect(single(c.matches)).toBe(endpoint);
	expect(c.parameters).toBeUndefined();
	expect(c.literals).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L75
test('BuildDfaTree_SingleEndpoint_Parameters', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint = createEndpoint('{a}/{b}/{c}');
	builder.addEndpoint(endpoint);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.literals).toBeUndefined();

	const a = root.parameters;
	if (a === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(a.matches).toBeUndefined();
	expect(a.literals).toBeUndefined();

	const b = a.parameters;
	if (b === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(b.matches).toBeUndefined();
	expect(b.literals).toBeUndefined();

	const c = b.parameters;
	if (c === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(single(c.matches)).toBe(endpoint);
	expect(c.parameters).toBeUndefined();
	expect(c.literals).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L105
test('BuildDfaTree_SingleEndpoint_CatchAll', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint = createEndpoint('{a}/{*b}');
	builder.addEndpoint(endpoint);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.literals).toBeUndefined();

	const a = root.parameters;

	if (a === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(single(a.matches)).toBe(endpoint);
	expect(a.literals).toBeUndefined();
	expect(a.parameters).toBeUndefined();

	const catchAll = a.catchAll;
	if (catchAll === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(single(catchAll.matches)).toBe(endpoint);
	expect(catchAll.literals).toBeUndefined();
	expect(catchAll.parameters).toBe(catchAll);
	expect(catchAll.catchAll).toBe(catchAll);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L137
test('BuildDfaTree_SingleEndpoint_CatchAllAtRoot', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint = createEndpoint('{*a}');
	builder.addEndpoint(endpoint);

	const root = builder.buildDfaTree();

	expect(single(root.matches)).toBe(endpoint);
	expect(root.literals).toBeUndefined();

	const catchAll = root.catchAll;
	if (catchAll === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(single(catchAll.matches)).toBe(endpoint);
	expect(catchAll.literals).toBeUndefined();
	expect(catchAll.parameters).toBe(catchAll);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L161
test('BuildDfaTree_MultipleEndpoint_LiteralAndLiteral', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint1 = createEndpoint('a/b1/c');
	builder.addEndpoint(endpoint1);

	const endpoint2 = createEndpoint('a/b2/c');
	builder.addEndpoint(endpoint2);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).toBeUndefined();

	let next = single(root.literals);
	expect(next[0]).toBe('a');

	const a = next[1];
	expect(a.matches).toBeUndefined();

	if (a.literals === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(a.literals.size).toBe(2);

	const b1 = a.literals.get('b1');
	if (b1 === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(b1.matches).toBeUndefined();
	expect(b1.parameters).toBeUndefined();

	next = single(b1.literals);
	expect(next[0]).toBe('c');

	const c1 = next[1];
	expect(single(c1.matches)).toBe(endpoint1);
	expect(c1.parameters).toBeUndefined();
	expect(c1.literals).toBeUndefined();

	const b2 = a.literals.get('b2');
	if (b2 === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(b2.matches).toBeUndefined();
	expect(b2.parameters).toBeUndefined();

	next = single(b2.literals);
	expect(next[0]).toBe('c');

	const c2 = next[1];
	expect(single(c2.matches)).toBe(endpoint2);
	expect(c2.parameters).toBeUndefined();
	expect(c2.literals).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L213
test('BuildDfaTree_MultipleEndpoint_LiteralDifferentCase', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint1 = createEndpoint('a/b1/c');
	builder.addEndpoint(endpoint1);

	const endpoint2 = createEndpoint('A/b2/c');
	builder.addEndpoint(endpoint2);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).toBeUndefined();

	let next = single(root.literals);
	expect(next[0]).toBe('a');

	const a = next[1];
	expect(a.matches).toBeUndefined();

	if (a.literals === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(a.literals.size).toBe(2);

	const b1 = a.literals.get('b1');
	if (b1 === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(b1.matches).toBeUndefined();
	expect(b1.parameters).toBeUndefined();

	next = single(b1.literals);
	expect(next[0]).toBe('c');

	const c1 = next[1];
	expect(single(c1.matches)).toBe(endpoint1);
	expect(c1.parameters).toBeUndefined();
	expect(c1.literals).toBeUndefined();

	const b2 = a.literals.get('b2');
	if (b2 === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(b2.matches).toBeUndefined();
	expect(b2.parameters).toBeUndefined();

	next = single(b2.literals);
	expect(next[0]).toBe('c');

	const c2 = next[1];
	expect(single(c2.matches)).toBe(endpoint2);
	expect(c2.parameters).toBeUndefined();
	expect(c2.literals).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L265
test('BuildDfaTree_MultipleEndpoint_LiteralAndParameter', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint1 = createEndpoint('a/b/c');
	builder.addEndpoint(endpoint1);

	const endpoint2 = createEndpoint('a/{b}/c');
	builder.addEndpoint(endpoint2);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).toBeUndefined();

	let next = single(root.literals);
	expect(next[0]).toBe('a');

	const a = next[1];
	expect(a.matches).toBeUndefined();

	next = single(a.literals);
	expect(next[0]).toBe('b');

	const b = next[1];
	expect(b.matches).toBeUndefined();
	expect(b.parameters).toBeUndefined();

	next = single(b.literals);
	expect(next[0]).toBe('c');

	const c1 = next[1];
	if (c1.matches === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(c1.matches[0]).toBe(endpoint1);
	expect(c1.matches[1]).toBe(endpoint2);
	expect(c1.parameters).toBeUndefined();
	expect(c1.literals).toBeUndefined();

	const b2 = a.parameters;
	if (b2 === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(b2.matches).toBeUndefined();
	expect(b2.parameters).toBeUndefined();

	next = single(b2.literals);
	expect(next[0]).toBe('c');

	const c2 = next[1];
	expect(single(c2.matches)).toBe(endpoint2);
	expect(c2.parameters).toBeUndefined();
	expect(c2.literals).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L321
test('BuildDfaTree_MultipleEndpoint_ParameterAndParameter', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint1 = createEndpoint('a/{b1}/c');
	builder.addEndpoint(endpoint1);

	const endpoint2 = createEndpoint('a/{b2}/c');
	builder.addEndpoint(endpoint2);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).toBeUndefined();

	let next = single(root.literals);
	expect(next[0]).toBe('a');

	const a = next[1];
	expect(a.matches).toBeUndefined();
	expect(a.literals).toBeUndefined();

	const b = a.parameters;
	if (b === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(b.matches).toBeUndefined();
	expect(b.parameters).toBeUndefined();

	next = single(b.literals);
	expect(next[0]).toBe('c');

	const c = next[1];
	if (c.matches === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(c.matches[0]).toBe(endpoint1);
	expect(c.matches[1]).toBe(endpoint2);
	expect(c.parameters).toBeUndefined();
	expect(c.literals).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L363
test('BuildDfaTree_MultipleEndpoint_LiteralAndCatchAll', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint1 = createEndpoint('a/b/c');
	builder.addEndpoint(endpoint1);

	const endpoint2 = createEndpoint('a/{*b}');
	builder.addEndpoint(endpoint2);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).toBeUndefined();

	let next = single(root.literals);
	expect(next[0]).toBe('a');

	const a = next[1];
	expect(single(a.matches)).toBe(endpoint2);

	next = single(a.literals);
	expect(next[0]).toBe('b');

	const b1 = next[1];
	expect(single(b1 /* REVIEW */.matches)).toBe(endpoint2);
	expect(b1.parameters).toBeUndefined();

	next = single(b1.literals);
	expect(next[0]).toBe('c');

	const c1 = next[1];
	if (c1.matches === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(c1.matches[0]).toBe(endpoint1);
	expect(c1.matches[1]).toBe(endpoint2);
	expect(c1.parameters).toBeUndefined();
	expect(c1.literals).toBeUndefined();

	const catchAll = a.catchAll;
	if (catchAll === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(single(catchAll.matches)).toBe(endpoint2);
	expect(catchAll.parameters).toBe(catchAll);
	expect(catchAll.catchAll).toBe(catchAll);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L412
test('BuildDfaTree_MultipleEndpoint_ParameterAndCatchAll', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint1 = createEndpoint('a/{b}/c');
	builder.addEndpoint(endpoint1);

	const endpoint2 = createEndpoint('a/{*b}');
	builder.addEndpoint(endpoint2);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).toBeUndefined();

	let next = single(root.literals);
	expect(next[0]).toBe('a');

	const a = next[1];
	expect(single(a.matches)).toBe(endpoint2);
	expect(a.literals).toBeUndefined();

	const b1 = a.parameters;
	if (b1 === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(single(b1 /* REVIEW */.matches)).toBe(endpoint2);
	expect(b1.parameters).toBeUndefined();

	next = single(b1.literals);
	expect(next[0]).toBe('c');

	const c1 = next[1];
	if (c1.matches === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(c1.matches[0]).toBe(endpoint1);
	expect(c1.matches[1]).toBe(endpoint2);
	expect(c1.parameters).toBeUndefined();
	expect(c1.literals).toBeUndefined();

	const catchAll = a.catchAll;
	if (catchAll === undefined) {
		throw new Error('Assertion failed.');
	}
	expect(single(catchAll.matches)).toBe(endpoint2);
	expect(catchAll.parameters).toBe(catchAll);
	expect(catchAll.catchAll).toBe(catchAll);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L459
/* TODO: test('BuildDfaTree_MultipleEndpoint_ConstrainedParameterTrimming_DoesNotMeetConstraint', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint1 = createEndpoint('a/c');
	builder.addEndpoint(endpoint1);

	const endpoint2 = createEndpoint('{a:length(2)}/b/c');
	builder.addEndpoint(endpoint2);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).not.toBeUndefined();

	const aNodeKvp = single(root.literals);
	expect(aNodeKvp[0]).toBe('a');

	const aNodeValue = aNodeKvp[1];
	const cNodeKvp = single(aNodeValue.literals);
	expect(cNodeKvp[0]).toBe('c');
	const cNode = cNodeKvp[1];

	// TODO
}); */

// TODO

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L674
test('BuildDfaTree_MultipleEndpoint_ComplexParameter_LiteralDoesNotMatchComplexParameter', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint1 = createEndpoint('a/c');
	builder.addEndpoint(endpoint1);

	const endpoint2 = createEndpoint('a{value}/b/c');
	builder.addEndpoint(endpoint2);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).not.toBeUndefined();

	const aNodeKvp = single(root.literals);
	expect(aNodeKvp[0]).toBe('a');

	const aNodeValue = aNodeKvp[1];
	const cNodeKvp = single(aNodeValue.literals);
	expect(cNodeKvp[0]).toBe('c');
	const cNode = cNodeKvp[1];

	expect(single(cNode.matches)).toBe(endpoint1);
	expect(cNode.literals).toBeUndefined();
	expect(cNode.parameters).toBeUndefined();

	if (root.parameters === undefined) {
		throw new Error('Assertion failed.');
	}
	const bNodeKvp = single(root.parameters.literals);
	expect(bNodeKvp[0]).toBe('b');
	const bNode = bNodeKvp[1];
	expect(bNode.parameters).toBeUndefined();
	expect(bNode.matches).toBeUndefined();
	const paramCNodeKvp = single(bNode.literals);

	expect(paramCNodeKvp[0]).toBe('c');
	const paramCNode = paramCNodeKvp[1];
	expect(single(paramCNode.matches)).toBe(endpoint2);
	expect(paramCNode.literals).toBeUndefined();
	expect(paramCNode.parameters).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherBuilderTest.cs#L719
/* TODO: test('BuildDfaTree_MultipleEndpoint_ComplexParameter_LiteralMatchesComplexParameter', () => {
	const builder = createDfaMatcherBuilder();

	const endpoint1 = createEndpoint('aa/c');
	builder.addEndpoint(endpoint1);

	const endpoint2 = createEndpoint('a{value}/b/c');
	builder.addEndpoint(endpoint2);

	const root = builder.buildDfaTree();

	expect(root.matches).toBeUndefined();
	expect(root.parameters).not.toBeUndefined();

	const aNodeKvp = single(root.literals);
	expect(aNodeKvp[0]).toBe('aa');

	const aNodeValue = aNodeKvp[1];
	if (aNodeValue.literals === undefined) {
		throw new Error('Assertion failed.');
	}
	let tryGetValueResult = tryGetValue(aNodeValue.literals, 'c');
	expect(tryGetValueResult.ok).toBe(true);
	const cNode = tryGetValueResult.unwrap();

	expect(single(cNode.matches)).toBe(endpoint1);
	expect(cNode.literals).toBeUndefined();
	expect(cNode.parameters).toBeUndefined();

	// Branch (aa) -> b -> c = (a{value}/b/c)

	tryGetValueResult = tryGetValue(aNodeValue.literals, 'b');
	expect(tryGetValueResult.ok).toBe(true);
	const bNode = tryGetValueResult.unwrap();
	expect(bNode.parameters).toBeUndefined();
	expect(bNode.matches).toBeUndefined();
	const paramBCNodeKvp = single(bNode.literals);
	expect(paramBCNodeKvp[0]).toBe('c');
	const paramBCNode = paramBCNodeKvp[1];

	// TODO
}); */

// TODO
