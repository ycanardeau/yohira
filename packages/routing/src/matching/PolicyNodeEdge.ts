import { Endpoint } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/PolicyNodeEdge.cs,5ba27cccdfe606d6,references
/**
 * Represents an edge in a matcher policy graph.
 */
export class PolicyNodeEdge {
	constructor(
		/**
		 * Gets the endpoints that match the policy defined by {@link State}.
		 */
		readonly endpoints: readonly Endpoint[],
		/**
		 * Gets the object used to represent the match heuristic. Can be a host, HTTP method, etc.
		 */
		readonly state: object,
	) {}
}
