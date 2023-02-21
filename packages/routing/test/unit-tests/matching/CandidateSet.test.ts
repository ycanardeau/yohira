import { NullLoggerFactory } from '@yohira/extensions.logging.abstractions';
import {
	CandidateSet,
	DfaMatcherBuilder,
	MatcherPolicy,
	RouteEndpoint,
	RouteEndpointBuilder,
	parseRoutePattern,
} from '@yohira/routing';
import { expect, test } from 'vitest';

import { emptyRequestDelegate } from '../TestConstants';

function createEndpoint(
	template: string,
	order = 0,
	...metadata: object[]
): RouteEndpoint {
	const builder = new RouteEndpointBuilder(
		emptyRequestDelegate,
		parseRoutePattern(template),
		order,
	);
	for (let i = 0; i < metadata.length; i++) {
		builder.metadata.add(metadata[i]);
	}

	builder.displayName = `test: ${template}`;
	return builder.build() as RouteEndpoint;
}

function createDfaMatcherBuilder(
	...policies: MatcherPolicy[]
): DfaMatcherBuilder {
	//const dataSource = new CompositeEndpointDataSource([]);
	return new DfaMatcherBuilder(
		NullLoggerFactory.instance,
		// TODO: Mock.of<ParameterPolicyFactory>(),
		{
			select(): Promise<void> {
				return Promise.resolve();
			},
		} /* REVIEW */,
		policies,
	);
}

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/CandidateSetTest.cs#L14
test('Create_CreatesCandidateSet', () => {
	const count = 10;
	const endpoints: RouteEndpoint[] = new Array(count);
	for (let i = 0; i < endpoints.length; i++) {
		endpoints[i] = createEndpoint(`/${i}`);
	}

	const builder = createDfaMatcherBuilder();
	const candidates = builder.createCandidates(endpoints);

	const candidateSet = new CandidateSet(candidates);

	for (let i = 0; i < candidateSet.count; i++) {
		const state = candidateSet.get(i);
		expect(candidateSet.isValidCandidate(i)).toBe(true);
		expect(state.get().endpoint).toBe(endpoints[i]);
		expect(state.get().score).toBe(candidates[i].score);
		// TODO: expect(state.get().values).toBeUndefined();

		candidateSet.setValidity(i, false);
		expect(candidateSet.isValidCandidate(i)).toBe(false);
	}
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/CandidateSetTest.cs#L45
test('ReplaceEndpoint_WithEndpoint', () => {
	const count = 10;
	const endpoints: RouteEndpoint[] = new Array(count);
	for (let i = 0; i < endpoints.length; i++) {
		endpoints[i] = createEndpoint(`/${i}`);
	}

	const builder = createDfaMatcherBuilder();
	const candidates = builder.createCandidates(endpoints);

	const candidateSet = new CandidateSet(candidates);

	for (let i = 0; i < candidateSet.count; i++) {
		const state = candidateSet.get(i);

		const endpoint = createEndpoint(`/test${i}`);
		// TODO

		candidateSet.replaceEndpoint(i, endpoint /* TODO: values */);

		expect(state.get().endpoint).toBe(endpoint);
		// TODO: expect(state.get().values).toBe(values);
		expect(candidateSet.isValidCandidate(i)).toBe(true);
	}
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/CandidateSetTest.cs#L78
test('ReplaceEndpoint_WithEndpoint_Null', () => {
	const count = 10;
	const endpoints: RouteEndpoint[] = new Array(count);
	for (let i = 0; i < endpoints.length; i++) {
		endpoints[i] = createEndpoint(`/${i}`);
	}

	const builder = createDfaMatcherBuilder();
	const candidates = builder.createCandidates(endpoints);

	const candidateSet = new CandidateSet(candidates);

	for (let i = 0; i < candidateSet.count; i++) {
		const state = candidateSet.get(i);

		candidateSet.replaceEndpoint(i, undefined);

		expect(state.get().endpoint).toBeUndefined();
		// TODO: expect(state.get().values).toBeUndefined();
		expect(candidateSet.isValidCandidate(i)).toBe(false);
	}
});

// TODO
