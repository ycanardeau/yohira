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
	// TODO: metadata,
): RouteEndpoint {
	return new RouteEndpoint(
		emptyRequestDelegate,
		routePattern,
		// TODO: order,
		// TODO
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
	// TODO: metadata,
): RouteEndpoint {
	const routePattern = parseRoutePattern(template /* TODO */);

	return createRouteEndpointCore(routePattern, order, displayName /* TODO */);
}
