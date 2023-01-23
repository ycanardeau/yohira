import {
	Endpoint,
	HttpMethods,
	RequestDelegate,
} from '@yohira/http.abstractions';

import { EndpointDataSource } from './EndpointDataSource';
import { RouteHandlerBuilder } from './builder/RouteHandlerBuilder';
import { RoutePattern } from './patterns/RoutePattern';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/RouteEndpointDataSource.cs,7d6e72cb02c99c6e,references
export class RouteEndpointDataSource extends EndpointDataSource {
	get endpoints(): readonly Endpoint[] {
		// TODO
		throw new Error('Method not implemented.');
	}

	addRequestDelegate(
		pattern: RoutePattern,
		requestDelegate: RequestDelegate,
		httpMethods: HttpMethods[] | undefined,
		// TODO: createHandlerRequestDelegateFunc
	): RouteHandlerBuilder {
		// TODO

		// TODO

		return new RouteHandlerBuilder(/* TODO: conventions, finallyConventions */);
	}
}
