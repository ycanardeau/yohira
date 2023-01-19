import { HttpMethods, RequestDelegate } from '@yohira/http.abstractions';
import { IEndpointConventionBuilder } from '@yohira/http.abstractions';

import { IEndpointRouteBuilder } from '../IEndpointRouteBuilder';
import { RoutePattern } from '../patterns/RoutePattern';
import { parseRoutePattern } from '../patterns/RoutePatternParser';

const getVerb = [HttpMethods.Get];

function map(
	endpoints: IEndpointRouteBuilder,
	pattern: RoutePattern,
	requestDelegate: RequestDelegate,
	httpMethods: HttpMethods[],
): IEndpointConventionBuilder {
	// TODO
	throw new Error('Method not implemented.');
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
