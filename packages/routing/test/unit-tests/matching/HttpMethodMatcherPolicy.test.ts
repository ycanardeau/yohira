import { typedef } from '@yohira/base';
import {
	EndpointMetadataCollection,
	HttpMethods,
} from '@yohira/http.abstractions';
import {
	HttpMethodMatcherPolicy,
	HttpMethodMetadata,
	IDynamicEndpointMetadata,
	IEndpointSelectorPolicy,
	INodeBuilderPolicy,
	RouteEndpoint,
	parseRoutePattern,
} from '@yohira/routing';
import { expect, test } from 'vitest';

import { emptyRequestDelegate } from '../TestConstants';

function createEndpoint(
	template: string,
	httpMethodMetadata: HttpMethodMetadata | undefined,
	...more: object[]
): RouteEndpoint {
	const metadata: object[] = [];
	if (httpMethodMetadata !== undefined) {
		metadata.push(httpMethodMetadata);
	}

	if (more !== undefined) {
		metadata.push(...more);
	}

	return new RouteEndpoint(
		emptyRequestDelegate,
		parseRoutePattern(template),
		0,
		new EndpointMetadataCollection(metadata),
		`test: ${template}`,
	);
}

function createPolicy(): HttpMethodMatcherPolicy {
	return new HttpMethodMatcherPolicy();
}

@typedef({
	implements: [Symbol.for('IDynamicEndpointMetadata')],
})
class DynamicEndpointMetadata implements IDynamicEndpointMetadata {
	get isDynamic(): boolean {
		return true;
	}
}

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyTest.cs#L13
test('INodeBuilderPolicy_AppliesToNode_EndpointWithoutMetadata_ReturnsFalse', () => {
	const endpoints = [createEndpoint('/', undefined)];

	const policy = createPolicy() as INodeBuilderPolicy;

	const result = policy.nodeBuilderAppliesToEndpoints(endpoints);

	expect(result).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyTest.cs#L28
test('INodeBuilderPolicy_AppliesToNode_EndpointWithoutHttpMethods_ReturnsFalse', () => {
	const endpoints = [createEndpoint('/', new HttpMethodMetadata([]))];

	const policy = createPolicy() as INodeBuilderPolicy;

	const result = policy.nodeBuilderAppliesToEndpoints(endpoints);

	expect(result).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyTest.cs#L46
test('INodeBuilderPolicy_AppliesToNode_EndpointHasHttpMethods_ReturnsTrue', () => {
	const endpoints = [
		createEndpoint('/', new HttpMethodMetadata([])),
		createEndpoint('/', new HttpMethodMetadata([HttpMethods.Get])),
	];

	const policy = createPolicy() as INodeBuilderPolicy;

	const result = policy.nodeBuilderAppliesToEndpoints(endpoints);

	expect(result).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyTest.cs#L65
test('INodeBuilderPolicy_AppliesToNode_EndpointIsDynamic_ReturnsFalse', () => {
	const endpoints = [
		createEndpoint('/', new HttpMethodMetadata([])),
		createEndpoint(
			'/',
			new HttpMethodMetadata([HttpMethods.Get]),
			new DynamicEndpointMetadata(),
		),
	];

	const policy = createPolicy() as INodeBuilderPolicy;

	const result = policy.nodeBuilderAppliesToEndpoints(endpoints);

	expect(result).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyTest.cs#L84
test('IEndpointSelectorPolicy_AppliesToNode_EndpointWithoutMetadata_ReturnsTrue', () => {
	const endpoints = [
		createEndpoint('/', undefined, new DynamicEndpointMetadata()),
	];

	const policy = createPolicy() as IEndpointSelectorPolicy;

	const result = policy.endpointSelectorAppliesToEndpoints(endpoints);

	expect(result).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyTest.cs#L99
test('IEndpointSelectorPolicy_AppliesToNode_EndpointWithoutHttpMethods_ReturnsTrue', () => {
	const endpoints = [
		createEndpoint(
			'/',
			new HttpMethodMetadata([]),
			new DynamicEndpointMetadata(),
		),
	];

	const policy = createPolicy() as IEndpointSelectorPolicy;

	const result = policy.endpointSelectorAppliesToEndpoints(endpoints);

	expect(result).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyTest.cs#L117
test('IEndpointSelectorPolicy_AppliesToNode_EndpointHasHttpMethods_ReturnsTrue', () => {
	const endpoints = [
		createEndpoint(
			'/',
			new HttpMethodMetadata([]),
			new DynamicEndpointMetadata(),
		),
		createEndpoint('/', new HttpMethodMetadata([HttpMethods.Get])),
	];

	const policy = createPolicy() as IEndpointSelectorPolicy;

	const result = policy.endpointSelectorAppliesToEndpoints(endpoints);

	expect(result).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyTest.cs#L136
test('IEndpointSelectorPolicy_AppliesToNode_EndpointIsNotDynamic_ReturnsFalse', () => {
	const endpoints = [
		createEndpoint('/', new HttpMethodMetadata([])),
		createEndpoint('/', new HttpMethodMetadata([HttpMethods.Get])),
	];

	const policy = createPolicy() as IEndpointSelectorPolicy;

	const result = policy.endpointSelectorAppliesToEndpoints(endpoints);

	expect(result).toBe(false);
});

// TODO

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyTest.cs#L177
/* TODO: test('GetEdges_GroupsByHttpMethod', () => {
	const endpoints = [
		// These are arrange in an order that we won't actually see in a product scenario. It's done
		// this way so we can verify that ordering is preserved by GetEdges.
		createEndpoint('/', new HttpMethodMetadata([HttpMethods.Get])),
		createEndpoint('/', new HttpMethodMetadata([])),
		createEndpoint(
			'/',
			new HttpMethodMetadata([
				HttpMethods.Get,
				HttpMethods.Put,
				HttpMethods.Post,
			]),
		),
		createEndpoint(
			'/',
			new HttpMethodMetadata([HttpMethods.Put, HttpMethods.Post]),
		),
		createEndpoint('/', new HttpMethodMetadata([])),
	];

	const policy = createPolicy();

	const edges = policy.getEdges(endpoints);

	// TODO
}); */

// TODO
