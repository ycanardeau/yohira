import { HttpMethods, RequestDelegate } from '@yohira/http.abstractions';
import { IEndpointConventionBuilder } from '@yohira/http.abstractions';

import { IEndpointRouteBuilder } from '../IEndpointRouteBuilder';

const getVerb = [HttpMethods.Get];

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Builder/EndpointRouteBuilderExtensions.cs,c18b91d56f8771f6,references
function mapMethods(
	endpoints: IEndpointRouteBuilder,
	pattern: string,
	httpMethods: string[],
	requestDelegate: RequestDelegate,
): IEndpointConventionBuilder {
	// TODO
	throw new Error('Method not implemented.');
}

export function mapGet(
	endpoints: IEndpointRouteBuilder,
	pattern: string,
	requestDelegate: RequestDelegate,
): IEndpointConventionBuilder {
	return mapMethods(endpoints, pattern, getVerb, requestDelegate);
}
