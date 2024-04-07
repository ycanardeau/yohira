import { FeatureCollection } from '@yohira/extensions.features';
import { HttpContext, HttpRequestFeature } from '@yohira/http';
import {
	EndpointMetadataCollection,
	IHttpContext,
	getEndpoint,
} from '@yohira/http.abstractions';
import { IHttpRequestFeature } from '@yohira/http.features';
import {
	CandidateSet,
	DefaultEndpointSelector,
	RouteEndpoint,
	parseRoutePattern,
} from '@yohira/routing';
import { expect, test } from 'vitest';

import { emptyRequestDelegate } from '../TestConstants';

function createContext(): IHttpContext {
	const features =
		new FeatureCollection(/* TODO: defaultFeatureCollectionSize */);
	const context = new HttpContext(features);
	features.set(IHttpRequestFeature, new HttpRequestFeature());
	// TODO
	return context;
}

function createEndpoint(template: string): RouteEndpoint {
	return new RouteEndpoint(
		emptyRequestDelegate,
		parseRoutePattern(template),
		0,
		EndpointMetadataCollection.empty(),
		`test: ${template}`,
	);
}

function createCandidateSet(
	endpoints: RouteEndpoint[],
	scores: number[],
): CandidateSet {
	return CandidateSet.fromEndpoints(endpoints /* TODO */, scores);
}

function createSelector(): DefaultEndpointSelector {
	return new DefaultEndpointSelector();
}

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DefaultEndpointSelectorTest.cs#L12
test('SelectAsync_NoCandidates_DoesNothing', async () => {
	const endpoints: RouteEndpoint[] = [];
	const scores: number[] = [];
	const candidateSet = createCandidateSet(endpoints, scores);

	const httpContext = createContext();
	const selector = createSelector();

	await selector.select(httpContext, candidateSet);

	expect(getEndpoint(httpContext)).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DefaultEndpointSelectorTest.cs#L30
test('SelectAsync_NoValidCandidates_DoesNothing', async () => {
	const endpoints: RouteEndpoint[] = [createEndpoint('/test')];
	const scores: number[] = [0];
	const candidateSet = createCandidateSet(endpoints, scores);

	// TODO: candidateSet[0].values =
	candidateSet.setValidity(0, false);

	const httpContext = createContext();
	const selector = createSelector();

	await selector.select(httpContext, candidateSet);

	expect(getEndpoint(httpContext)).toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DefaultEndpointSelectorTest.cs#L51
test('SelectAsync_SingleCandidate_ChoosesCandidate', async () => {
	const endpoints: RouteEndpoint[] = [createEndpoint('/test')];
	const scores: number[] = [0];
	const candidateSet = createCandidateSet(endpoints, scores);

	// TODO
	candidateSet.setValidity(0, true);

	const httpContext = createContext();
	const selector = createSelector();

	await selector.select(httpContext, candidateSet);

	expect(getEndpoint(httpContext)).toBe(endpoints[0]);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DefaultEndpointSelectorTest.cs#L72
test('SelectAsync_SingleValidCandidate_ChoosesCandidate', async () => {
	const endpoints: RouteEndpoint[] = [
		createEndpoint('/test1'),
		createEndpoint('/test2'),
	];
	const scores: number[] = [0, 0];
	const candidateSet = createCandidateSet(endpoints, scores);

	candidateSet.setValidity(0, false);
	candidateSet.setValidity(1, true);

	const httpContext = createContext();
	const selector = createSelector();

	await selector.select(httpContext, candidateSet);

	expect(getEndpoint(httpContext)).toBe(endpoints[1]);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DefaultEndpointSelectorTest.cs#L93
test('SelectAsync_SingleValidCandidateInGroup_ChoosesCandidate', async () => {
	const endpoints: RouteEndpoint[] = [
		createEndpoint('/test1'),
		createEndpoint('/test2'),
		createEndpoint('/test3'),
	];
	const scores: number[] = [0, 0, 1];
	const candidateSet = createCandidateSet(endpoints, scores);

	candidateSet.setValidity(0, false);
	candidateSet.setValidity(1, true);
	candidateSet.setValidity(2, true);

	const httpContext = createContext();
	const selector = createSelector();

	await selector.select(httpContext, candidateSet);

	expect(getEndpoint(httpContext)).toBe(endpoints[1]);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DefaultEndpointSelectorTest.cs#L115
test('SelectAsync_ManyGroupsLastCandidate_ChoosesCandidate', async () => {
	const endpoints: RouteEndpoint[] = [
		createEndpoint('/test1'),
		createEndpoint('/test2'),
		createEndpoint('/test3'),
		createEndpoint('/test4'),
		createEndpoint('/test5'),
	];
	const scores: number[] = [0, 1, 2, 3, 4];
	const candidateSet = createCandidateSet(endpoints, scores);

	candidateSet.setValidity(0, false);
	candidateSet.setValidity(1, false);
	candidateSet.setValidity(2, false);
	candidateSet.setValidity(3, false);
	candidateSet.setValidity(4, true);

	const httpContext = createContext();
	const selector = createSelector();

	await selector.select(httpContext, candidateSet);

	expect(getEndpoint(httpContext)).toBe(endpoints[4]);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DefaultEndpointSelectorTest.cs#L146
test('SelectAsync_MultipleValidCandidatesInGroup_ReportsAmbiguity', async () => {
	const endpoints: RouteEndpoint[] = [
		createEndpoint('/test1'),
		createEndpoint('/test2'),
		createEndpoint('/test3'),
	];
	const scores: number[] = [0, 1, 1];
	const candidateSet = createCandidateSet(endpoints, scores);

	candidateSet.setValidity(0, false);
	candidateSet.setValidity(1, true);
	candidateSet.setValidity(2, true);

	const httpContext = createContext();
	const selector = createSelector();

	expect(
		async () => await selector.select(httpContext, candidateSet),
	).rejects.toThrowError(
		'The request matched multiple endpoints. Matches: \n\ntest: /test2\ntest: /test3',
	);
	expect(getEndpoint(httpContext)).toBeUndefined();
});
