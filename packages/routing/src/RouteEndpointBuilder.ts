import { IList } from '@yohira/base';
import {
	Endpoint,
	EndpointBuilder,
	EndpointMetadataCollection,
	RequestDelegate,
} from '@yohira/http.abstractions';

import { IHttpMethodMetadata } from './IHttpMethodMetadata';
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

	private static isIHttpMethodMetadata(
		metadata: object,
	): metadata is IHttpMethodMetadata {
		return 'acceptCorsPreflight' in metadata && 'httpMethods' in metadata;
	}

	private static isICorsMetadata(metadata: object): boolean {
		return false; /* TODO */
	}

	private static createMetadataCollection(
		metadata: IList<object>,
	): EndpointMetadataCollection {
		if (metadata.count > 0) {
			let hasCorsMetadata = false;
			let httpMethodMetadata: IHttpMethodMetadata | undefined = undefined;

			// Before create the final collection we
			// need to update the IHttpMethodMetadata if
			// a CORS metadata is present
			for (const item of metadata) {
				// Not using else if since a metadata could have both
				// interfaces.

				if (RouteEndpointBuilder.isIHttpMethodMetadata(item)) {
					// Storing only the last entry
					// since the last metadata is the most significant.
					httpMethodMetadata = item;
				}

				if (
					!hasCorsMetadata &&
					RouteEndpointBuilder.isICorsMetadata(item)
				) {
					// IEnableCorsAttribute, IDisableCorsAttribute and ICorsPolicyMetadata
					// are ICorsMetadata
					hasCorsMetadata = true;
				}
			}

			if (
				hasCorsMetadata &&
				httpMethodMetadata !== undefined &&
				!httpMethodMetadata.acceptCorsPreflight
			) {
				// Since we found a CORS metadata we will update it
				// to make sure the acceptCorsPreflight is set to true.
				httpMethodMetadata.acceptCorsPreflight = true;
			}
		}

		return new EndpointMetadataCollection(metadata);
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
			this.order,
			RouteEndpointBuilder.createMetadataCollection(this.metadata),
			this.displayName,
		);
	}
}
