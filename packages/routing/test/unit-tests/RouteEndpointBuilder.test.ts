import { HttpMethods } from '@yohira/http.abstractions';
import {
	RouteEndpoint,
	RouteEndpointBuilder,
	parseRoutePattern,
} from '@yohira/routing';
import { HttpMethodMetadata } from '@yohira/routing';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/RouteEndpointBuilderTest.cs#L13
test('Constructor_AllowsNullRequestDelegate', () => {
	const builder = new RouteEndpointBuilder(
		undefined,
		parseRoutePattern('/'),
		0,
	);
	expect(builder.requestDelegate).toBeUndefined();
});

// TODO

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/RouteEndpointBuilderTest.cs#L27
test('Build_AllValuesSet_EndpointCreated', () => {
	const defaultOrder = 0;
	const metadata = {};
	const requestDelegate = (): Promise<void> => Promise.resolve();

	const builder = new RouteEndpointBuilder(
		requestDelegate,
		parseRoutePattern('/'),
		defaultOrder,
	);
	builder.displayName = 'Display name!';
	builder.metadata.add(metadata);

	const endpoint = builder.build() as RouteEndpoint;
	expect(endpoint).toBeInstanceOf(RouteEndpoint);
	expect(endpoint.displayName).toBe('Display name!');
	expect(endpoint.requestDelegate).toBe(requestDelegate);
	expect(endpoint.routePattern.rawText).toBe('/');
	// TODO: metadata
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/RouteEndpointBuilderTest.cs#L48
/* TODO: test('Build_UpdateHttpMethodMetadata_WhenCorsPresent', () => {
	const defaultOrder = 0;
	const requestDelegate = (): Promise<void> => Promise.resolve();

	const builder = new RouteEndpointBuilder(
		requestDelegate,
		parseRoutePattern('/'),
		defaultOrder,
	);
	builder.displayName = 'Display name!';
	// TODO: builder.metadata.add(new TestCorsMetadata());
	builder.metadata.add(new HttpMethodMetadata([HttpMethods.Delete], false));

	const endpoint = builder.build() as RouteEndpoint;
	expect(endpoint).toBeInstanceOf(RouteEndpoint);
	// TODO: const httpMethodMetadata = ...
	// TODO: expect(httpMethodMetadata).not.toBeUndefined();
	// TODO: expect(httpMethodMetadata.acceptCorsPreflight).toBe(true)
}); */

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/RouteEndpointBuilderTest.cs#L68
/* TODO: test('Build_UpdateLastHttpMethodMetadata_WhenCorsPresent', () => {
	const defaultOrder = 0;
	const requestDelegate = (): Promise<void> => Promise.resolve();

	const builder = new RouteEndpointBuilder(
		requestDelegate,
		parseRoutePattern('/'),
		defaultOrder,
	);
	builder.displayName = 'Display name!';
	builder.metadata.add(new HttpMethodMetadata([HttpMethods.Get], false));
	// TODO: builder.metadata.add(new TestCorsMetadata());
	builder.metadata.add(new HttpMethodMetadata([HttpMethods.Delete], false));

	const endpoint = builder.build() as RouteEndpoint;
	expect(endpoint).toBeInstanceOf(RouteEndpoint);

	// TODO
}); */

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/RouteEndpointBuilderTest.cs#L89
/* TODO: test('Build_DoesNotChangeHttpMethodMetadata_WhenCorsNotPresent', () => {
	const defaultOrder = 0;
	const requestDelegate = (): Promise<void> => Promise.resolve();

	const builder = new RouteEndpointBuilder(
		requestDelegate,
		parseRoutePattern('/'),
		defaultOrder,
	);

	const endpoint = builder.build() as RouteEndpoint;
	expect(endpoint).toBeInstanceOf(RouteEndpoint);
	// TODO: const httpMethodMetadata = ...
	// TODO: expect(httpMethodMetadata).not.toBeUndefined();
	// TODO: expect(httpMethodMetadata.acceptCorsPreflight).toBe(false);
}); */

// TODO
