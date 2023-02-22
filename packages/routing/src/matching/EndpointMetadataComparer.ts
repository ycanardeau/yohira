import { IComparer, getOrAdd } from '@yohira/base';
import { Endpoint } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/EndpointMetadataComparer.cs,decd9941738fedf3,references
export abstract class EndpointMetadataComparer<TMetadata extends object>
	implements IComparer<Endpoint>
{
	constructor(private readonly metadataType: symbol) {}

	private static instances = new Map<
		symbol,
		EndpointMetadataComparer<object>
	>();
	static getDefault<TMetadata extends object>(
		metadataType: symbol,
	): EndpointMetadataComparer<TMetadata> {
		return getOrAdd(
			EndpointMetadataComparer.instances,
			metadataType,
			(key) => new DefaultComparer(key),
		) as EndpointMetadataComparer<TMetadata>;
	}

	protected getMetadata(endpoint: Endpoint): TMetadata | undefined {
		return endpoint.metadata.getMetadata(this.metadataType);
	}

	protected compareMetadata(
		x: TMetadata | undefined,
		y: TMetadata | undefined,
	): number {
		// The default policy is that if x endpoint defines TMetadata, and
		// y endpoint does not, then x is *more specific* than y. We return
		// -1 for this case so that x will come first in the sort order.

		if (x === undefined && y !== undefined) {
			// y is more specific
			return 1;
		} else if (x !== undefined && y === undefined) {
			// x is more specific
			return -1;
		}

		// both endpoints have this metadata, or both do not have it, they have
		// the same specificity.
		return 0;
	}

	compare(x: Endpoint, y: Endpoint): number {
		return this.compareMetadata(this.getMetadata(x), this.getMetadata(y));
	}
}

class DefaultComparer<T extends object> extends EndpointMetadataComparer<T> {}
