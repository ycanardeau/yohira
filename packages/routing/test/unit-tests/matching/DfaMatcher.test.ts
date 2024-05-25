import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
	addSingletonInstance,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import { FeatureCollection } from '@yohira/extensions.features';
import { addLogging } from '@yohira/extensions.logging';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { addOptions } from '@yohira/extensions.options';
import { HttpContext, HttpRequestFeature } from '@yohira/http';
import { IHttpContext, PathString } from '@yohira/http.abstractions';
import { IHttpRequestFeature } from '@yohira/http.features';
import {
	DataSourceDependentMatcher,
	DefaultEndpointDataSource,
	DfaMatcher,
	EndpointDataSource,
	EndpointSelector,
	MatcherFactory,
	PathSegment,
	RouteEndpoint,
	addRouting,
	tokenize,
} from '@yohira/routing';
import { expect, test } from 'vitest';

import { createRouteEndpoint } from '../EndpointFactory';

function createEndpoint(
	template: string,
	order: number,
	// TODO: defaults,
	// TODO: requiredValues,
	// TODO: policies
): RouteEndpoint {
	return createRouteEndpoint(
		template,
		// TODO: defaults,
		// TODO: policies,
		// TODO: requiredValues,
		order,
		template,
	);
}

function createDfaMatcher(
	dataSource: EndpointDataSource,
	// TODO: policies,
	endpointSelector?: EndpointSelector,
	loggerFactory?: ILoggerFactory,
): DataSourceDependentMatcher {
	let serviceCollection: IServiceCollection;
	serviceCollection = new ServiceCollection();
	serviceCollection = addLogging(serviceCollection);
	serviceCollection = addOptions(serviceCollection);
	serviceCollection = addRouting(serviceCollection, (options) => {
		// TODO: options.constraintMap
	});

	// TODO

	if (endpointSelector !== undefined) {
		addSingletonInstance(
			serviceCollection,
			Symbol.for('EndpointSelector'),
			endpointSelector,
		);
	}

	if (loggerFactory !== undefined) {
		addSingletonInstance(serviceCollection, ILoggerFactory, loggerFactory);
	}

	const services = buildServiceProvider(serviceCollection);

	const factory = getRequiredService<MatcherFactory>(
		services,
		Symbol.for('MatcherFactory'),
	);
	const matcher = factory.createMatcher(dataSource);
	if (!(matcher instanceof DataSourceDependentMatcher)) {
		throw new Error('Assertion failed.');
	}
	return matcher;
}

function createContext(): IHttpContext {
	return HttpContext.createWithDefaultFeatureCollection();
}

// TODO

function createMatchingContext(
	requestPath: string,
	buffer: PathSegment[],
): {
	context: IHttpContext;
	path: string;
	count: number;
} {
	const context = createContext();
	context.request.path = new PathString(requestPath);

	const count = tokenize(requestPath, buffer);
	return { context: context, path: requestPath, count: count };
}

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DfaMatcherTest.cs#L355
test('MatchAsync_ConstrainedParameter_EndpointMatched', () => {
	const endpoint1 = createEndpoint('a/c', 0);
	const endpoint2 = createEndpoint('{param:length(2)}/b/c', 0);

	const dataSource = new DefaultEndpointDataSource([endpoint1, endpoint2]);

	const matcher = createDfaMatcher(dataSource).currentMatcher as DfaMatcher;
	const buffer: PathSegment[] = new Array(3);
	const { context, path, count } = createMatchingContext('/aa/b/c', buffer);

	const set = matcher.findCandidateSet(context, path, buffer.slice(0, count));

	// We expect endpoint2 to match here since we trimmed the branch for the parameter based on `a` not meeting
	// the constraints.
	expect(set.candidates.length).toBe(1);
	const candidate = set.candidates[0];
	expect(candidate.endpoint).toBe(endpoint2);
});

// TODO
