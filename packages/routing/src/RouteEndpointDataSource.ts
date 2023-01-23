import { List } from '@yohira/base';
import {
	Endpoint,
	HttpMethods,
	RequestDelegate,
} from '@yohira/http.abstractions';

import { EndpointDataSource } from './EndpointDataSource';
import { RouteEndpoint } from './RouteEndpoint';
import { RouteEndpointBuilder } from './RouteEndpointBuilder';
import { RouteHandlerBuilder } from './builder/RouteHandlerBuilder';
import { RoutePattern } from './patterns/RoutePattern';
import { combineRoutePattern } from './patterns/RoutePatternFactory';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/RouteEndpointDataSource.cs,1c40798706e5be79,references
class RouteEntry {
	routePattern!: RoutePattern;
	routeHandler!: RequestDelegate;
	httpMethods!: HttpMethods[] | undefined;
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/RouteEndpointDataSource.cs,7d6e72cb02c99c6e,references
export class RouteEndpointDataSource extends EndpointDataSource {
	private readonly routeEntries = new List<RouteEntry>();

	private createRouteEndpointBuilder(
		entry: RouteEntry,
		groupPrefix?: RoutePattern,
		/* TODO: groupConventions?: readonly ((builder: EndpointBuilder) => void)[],
		groupFinallyConventions?: readonly ((
			endpointBuilder: EndpointBuilder,
		) => void)[], */
	): RouteEndpointBuilder {
		const pattern = combineRoutePattern(groupPrefix, entry.routePattern);
		// TODO
		const isFallback = false; /* TODO */

		const order = isFallback ? Number.MAX_VALUE : 0;
		let displayName = pattern.rawText ?? pattern.debuggerToString();

		// TODO

		if (entry.httpMethods !== undefined) {
			// Prepends the HTTP method to the displayName produced with pattern + method name
			displayName = `HTTP: ${entry.httpMethods.join(
				', ',
			)} ${displayName}`;
		}

		if (isFallback) {
			displayName = `Fallback ${displayName}`;
		}

		// TODO

		const builder = new RouteEndpointBuilder(
			() => Promise.resolve() /* TODO: redirectRequestDelegate */,
			pattern,
			order,
		);
		builder.displayName = displayName;
		// TODO: builder.appServices = this.appServices;

		// TODO

		return builder;
	}

	get endpoints(): readonly Endpoint[] {
		const endpoints: RouteEndpoint[] = new Array(this.routeEntries.count);
		for (let i = 0; i < this.routeEntries.count; i++) {
			endpoints[i] = this.createRouteEndpointBuilder(
				this.routeEntries.get(i),
			).build() as RouteEndpoint;
		}
		return endpoints;
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
