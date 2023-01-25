import { IList, List } from '@yohira/base';

import { RequestDelegate } from '../RequestDelegate';
import { Endpoint } from '../routing/Endpoint';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/EndpointBuilder.cs,ebacfd63dc72247b,references
/**
 * A base class for building an new {@link Endpoint}.
 */
export abstract class EndpointBuilder {
	/**
	 * Gets or sets the delegate used to process requests for the endpoint.
	 */
	requestDelegate?: RequestDelegate;
	/**
	 * Gets or sets the informational display name of this endpoint.
	 */
	displayName?: string;
	/**
	 * Gets the collection of metadata associated with this endpoint.
	 */
	readonly metadata: IList<object> = new List();

	/**
	 * Creates an instance of {@link Endpoint} from the {@link EndpointBuilder}.
	 * @returns The created {@link Endpoint}.
	 */
	abstract build(): Endpoint;
}
