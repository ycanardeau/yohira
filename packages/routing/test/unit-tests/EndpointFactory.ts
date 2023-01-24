import {
	RouteEndpoint,
	RoutePattern,
	parseRoutePattern,
} from '@yohira/routing';

import { emptyRequestDelegate } from './TestConstants';

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/EndpointFactory.cs#L25
function createRouteEndpointCore(
	routePattern: RoutePattern,
	order = 0,
	displayName?: string,
	metadata?: undefined /* TODO */,
): RouteEndpoint {
	return new RouteEndpoint(
		emptyRequestDelegate,
		routePattern,
		order,
		undefined /* TODO */,
		displayName,
	);
}

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/EndpointFactory.cs#L11
export function createRouteEndpoint(
	template: string,
	// TODO: defaults,
	// TODO: policies,
	// TODO: requiredValues,
	order = 0,
	displayName?: string,
	metadata?: undefined /* TODO */,
): RouteEndpoint {
	const routePattern = parseRoutePattern(template /* TODO */);

	return createRouteEndpointCore(routePattern, order, displayName, metadata);
}
