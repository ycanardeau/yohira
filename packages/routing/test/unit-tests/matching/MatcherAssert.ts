import { Endpoint, IHttpContext, getEndpoint } from '@yohira/http.abstractions';

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/MatcherAssert.cs#L104
function formatRouteValues(/* TODO */): string {
	// TODO
	throw new Error('Method not implemented.');
}

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/MatcherAssert.cs#L55
export function assertMatch(
	httpContext: IHttpContext,
	expected: Endpoint,
	// TODO: values,
	ignoreValues = false,
): void {
	if (getEndpoint(httpContext) === undefined) {
		throw new Error(
			`Was expected to match '${expected.displayName}' but did not match.`,
		);
	}

	/* TODO: const actualValues = httpContext.request.routeValues;

	if (actualValues === undefined) {
		throw new Error('RouteValues is null.');
	} */

	if (expected !== getEndpoint(httpContext)) {
		throw new Error(
			`Was expected to match '${expected.displayName}' but matched ` +
				`'${getEndpoint(httpContext)?.displayName}' with values: ${
					formatRouteValues(/* TODO: actualValues */)
				}.`,
		);
	}

	if (!ignoreValues) {
		// TODO
		//throw new Error('Method not implemented.');
	}
}
