import { Endpoint } from '@yohira/http.abstractions';

import { PolicyJumpTable } from './PolicyJumpTable';
import { PolicyJumpTableEdge } from './PolicyJumpTableEdge';
import { PolicyNodeEdge } from './PolicyNodeEdge';

export const INodeBuilderPolicy = Symbol.for('INodeBuilderPolicy');
// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/INodeBuilderPolicy.cs,f1ec7c18073d9dc1,references
/**
 * Implements an interface for a matcher policy with support for generating graph representations of the endpoints.
 */
export interface INodeBuilderPolicy {
	/**
	 * Evaluates if the policy matches any of the endpoints provided in {@link endpoints}.
	 * @param endpoints A list of {@link Endpoint}.
	 * @returns true if the policy applies to any of the provided {@link endpoints}.
	 */
	nodeBuilderAppliesToEndpoints(endpoints: readonly Endpoint[]): boolean;
	/**
	 * Generates a graph that representations the relationship between endpoints and hosts.
	 * @param endpoints A list of {@link Endpoint}.
	 * @returns A graph representing the relationship between endpoints and hosts.
	 */
	getEdges(endpoints: readonly Endpoint[]): readonly PolicyNodeEdge[];
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
