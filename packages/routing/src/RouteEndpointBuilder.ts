import {
	Endpoint,
	EndpointBuilder,
	RequestDelegate,
} from '@yohira/http.abstractions';

import { RouteEndpoint } from './RouteEndpoint';
import { RoutePattern } from './patterns/RoutePattern';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/RouteEndpointBuilder.cs,b979469d53602c4a,references
/**
 * Supports building a new {@link RouteEndpoint}.
 */
export class RouteEndpointBuilder extends EndpointBuilder {
	constructor(
		requestDelegate: RequestDelegate | undefined,
		/**
		 * Gets or sets the {@link RoutePattern} associated with this endpoint.
		 */
		public routePattern: RoutePattern,
		/**
		 * Gets or sets the order assigned to the endpoint.
		 */
		public order: number,
	) {
		super();

		this.requestDelegate = requestDelegate;
	}

	build(): Endpoint {
		if (this.requestDelegate === undefined) {
			throw new Error(
				'RequestDelegate must be specified to construct a RouteEndpoint',
			);
		}

		return new RouteEndpoint(
			this.requestDelegate,
			this.routePattern,
			// TODO: this.order,
			// TODO: createMetadataCollection(this.metadata),
			this.displayName,
		);
	}
}
