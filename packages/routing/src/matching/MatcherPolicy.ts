import { Type } from '@yohira/base';
import { Endpoint } from '@yohira/http.abstractions';

import { IDynamicEndpointMetadata } from '../IDynamicEndpointMetadata';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/MatcherPolicy.cs,cec15078b8fecbc6,references
export abstract class MatcherPolicy {
	abstract readonly order: number;

	protected static containsDynamicEndpoints(
		endpoints: readonly Endpoint[],
	): boolean {
		for (const endpoint of endpoints) {
			const metadata =
				endpoint.metadata.getMetadata<IDynamicEndpointMetadata>(
					Type.from('IDynamicEndpointMetadata'),
				);
			if (metadata?.isDynamic === true) {
				return true;
			}
		}

		return false;
	}
}
