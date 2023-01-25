import { IEndpointSelectorPolicy } from './IEndpointSelectorPolicy';
import { INodeBuilderPolicy } from './INodeBuilderPolicy';
import { MatcherPolicy } from './MatcherPolicy';
import { PolicyJumpTable } from './PolicyJumpTable';
import { PolicyJumpTableEdge } from './PolicyJumpTableEdge';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/HttpMethodMatcherPolicy.cs,e1986934a0392a00,references
export class HttpMethodMatcherPolicy
	extends MatcherPolicy
	implements INodeBuilderPolicy, IEndpointSelectorPolicy
{
	get order(): number {
		return -1000;
	}

	buildJumpTable(
		exitDestination: number,
		edges: readonly PolicyJumpTableEdge[],
	): PolicyJumpTable {
		// TODO
		throw new Error('Method not implemented.');
	}
}
