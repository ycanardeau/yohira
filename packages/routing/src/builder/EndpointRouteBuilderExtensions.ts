import { HttpMethods, RequestDelegate } from '@yohira/http.abstractions';
import { IEndpointConventionBuilder } from '@yohira/http.abstractions';

import { IEndpointRouteBuilder } from '../IEndpointRouteBuilder';
import { RouteEndpointDataSource } from '../RouteEndpointDataSource';
import { RoutePattern } from '../patterns/RoutePattern';
import { parseRoutePattern } from '../patterns/RoutePatternParser';

const getVerb = [HttpMethods.Get];
const postVerb = [HttpMethods.Post];
const putVerb = [HttpMethods.Put];
const deleteVerb = [HttpMethods.Delete];
const patchVerb = [HttpMethods.Patch];

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Builder/EndpointRouteBuilderExtensions.cs,9671c2cebb1a83d1,references
function getOrAddRouteEndpointDataSource(
	endpoints: IEndpointRouteBuilder,
): RouteEndpointDataSource {
	let routeEndpointDataSource: RouteEndpointDataSource | undefined;

	for (const dataSource of endpoints.dataSources) {
		if (dataSource instanceof RouteEndpointDataSource) {
			routeEndpointDataSource = dataSource;
			break;
		}
	}

	if (routeEndpointDataSource === undefined) {
		// TODO

		routeEndpointDataSource = new RouteEndpointDataSource(/* TODO */);
		endpoints.dataSources.add(routeEndpointDataSource);
	}

	return routeEndpointDataSource;
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Builder/EndpointRouteBuilderExtensions.cs,74095d69306891e4,references
function map(
	endpoints: IEndpointRouteBuilder,
	pattern: RoutePattern,
	requestDelegate: RequestDelegate,
	httpMethods: HttpMethods[],
): IEndpointConventionBuilder {
	return getOrAddRouteEndpointDataSource(endpoints).addRequestDelegate(
		pattern,
		requestDelegate,
		httpMethods,
		// TODO: createHandlerRequestDelegate,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Builder/EndpointRouteBuilderExtensions.cs,c18b91d56f8771f6,references
function mapMethods(
	endpoints: IEndpointRouteBuilder,
	pattern: string,
	httpMethods: HttpMethods[],
	requestDelegate: RequestDelegate,
): IEndpointConventionBuilder {
	return map(
		endpoints,
		parseRoutePattern(pattern),
		requestDelegate,
		httpMethods,
	);
}

export function mapGet(
	endpoints: IEndpointRouteBuilder,
	pattern: string,
	requestDelegate: RequestDelegate,
): IEndpointConventionBuilder {
	return mapMethods(endpoints, pattern, getVerb, requestDelegate);
}

export function mapPost(
	endpoints: IEndpointRouteBuilder,
	pattern: string,
	requestDelegate: RequestDelegate,
): IEndpointConventionBuilder {
	return mapMethods(endpoints, pattern, postVerb, requestDelegate);
}

export function mapPut(
	endpoints: IEndpointRouteBuilder,
	pattern: string,
	requestDelegate: RequestDelegate,
): IEndpointConventionBuilder {
	return mapMethods(endpoints, pattern, putVerb, requestDelegate);
}

export function mapDelete(
	endpoints: IEndpointRouteBuilder,
	pattern: string,
	requestDelegate: RequestDelegate,
): IEndpointConventionBuilder {
	return mapMethods(endpoints, pattern, deleteVerb, requestDelegate);
}

export function mapPatch(
	endpoints: IEndpointRouteBuilder,
	pattern: string,
	requestDelegate: RequestDelegate,
): IEndpointConventionBuilder {
	return mapMethods(endpoints, pattern, patchVerb, requestDelegate);
}
