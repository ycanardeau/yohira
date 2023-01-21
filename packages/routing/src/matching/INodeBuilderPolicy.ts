import { PolicyJumpTable } from './PolicyJumpTable';
import { PolicyJumpTableEdge } from './PolicyJumpTableEdge';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/INodeBuilderPolicy.cs,f1ec7c18073d9dc1,references
/**
 * Implements an interface for a matcher policy with support for generating graph representations of the endpoints.
 */
export interface INodeBuilderPolicy {
	/**
	 * Constructs a jump table given the a set of {@link edges}.
	 * @param exitDestination The default destination for lookups.
	 * @param edges A list of {@link PolicyJumpTableEdge}.
	 */
	buildJumpTable(
		exitDestination: number,
		edges: readonly PolicyJumpTableEdge[],
	): PolicyJumpTable;
}
