import { List } from '@yohira/base';
import {
	Endpoint,
	HttpMethods,
	RequestDelegate,
} from '@yohira/http.abstractions';

import { EndpointDataSource } from './EndpointDataSource';
import { RouteHandlerBuilder } from './builder/RouteHandlerBuilder';
import { RoutePattern } from './patterns/RoutePattern';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/RouteEndpointDataSource.cs,1c40798706e5be79,references
class RouteEntry {
	routePattern!: RoutePattern;
	routeHandler!: RequestDelegate;
	httpMethods!: HttpMethods[] | undefined;
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/RouteEndpointDataSource.cs,7d6e72cb02c99c6e,references
export class RouteEndpointDataSource extends EndpointDataSource {
	private readonly routeEntries = new List<RouteEntry>();

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

		const routeEntry = new RouteEntry();
		routeEntry.routePattern = pattern;
		routeEntry.routeHandler = requestDelegate;
		routeEntry.httpMethods = httpMethods;
		// TODO
		this.routeEntries.add(routeEntry);

		return new RouteHandlerBuilder(/* TODO: conventions, finallyConventions */);
	}
}
