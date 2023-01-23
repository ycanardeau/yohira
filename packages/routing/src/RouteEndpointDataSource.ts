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

// https://source.dot.net/#Microsoft.AspNetCore.Routing/RouteEndpointDataSource.cs,755f55d4f2715281,references
enum RouteAttributes {
	/**
	 * The endpoint was defined by a RequestDelegate, RequestDelegateFactory.create() should be skipped unless there are endpoint filters.
	 */
	None = 0,
	/**
	 * This was added as Delegate route handler, so RequestDelegateFactory.create() should always be called.
	 */
	RouteHandler = 1,
	/**
	 * This was added by MapFallback.
	 */
	Fallback = 2,
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/RouteEndpointDataSource.cs,1c40798706e5be79,references
class RouteEntry {
	routePattern!: RoutePattern;
	routeHandler!: RequestDelegate;
	httpMethods!: HttpMethods[] | undefined;
	routeAttributes!: RouteAttributes;
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
		const isRouteHandler =
			(entry.routeAttributes & RouteAttributes.RouteHandler) ===
			RouteAttributes.RouteHandler;
		const isFallback =
			(entry.routeAttributes & RouteAttributes.Fallback) ===
			RouteAttributes.Fallback;

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

		// If we're not a route handler, we started with a fully realized (although unfiltered) RequestDelegate, so we can just redirect to that
		// while running any conventions. We'll put the original back if it remains unfiltered right before building the endpoint.
		const factoryCreatedRequestDelegate = isRouteHandler
			? undefined
			: entry.routeHandler;

		// Let existing conventions capture and call into builder.requestDelegate as long as they do so after it has been created.
		const redirectRequestDelegate: RequestDelegate = (context) => {
			if (factoryCreatedRequestDelegate === undefined) {
				throw new Error(
					'This RequestDelegate cannot be called before the final endpoint is built.' /* LOC */,
				);
			}

			return factoryCreatedRequestDelegate(context);
		};

		const builder = new RouteEndpointBuilder(
			redirectRequestDelegate,
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
		routeEntry.routeAttributes = RouteAttributes.None;
		// TODO
		this.routeEntries.add(routeEntry);

		return new RouteHandlerBuilder(/* TODO: conventions, finallyConventions */);
	}
}
