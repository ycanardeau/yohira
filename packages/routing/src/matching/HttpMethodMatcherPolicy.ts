import { Type, typedef } from '@yohira/base';
import { HttpContext } from '@yohira/http';
import { Endpoint } from '@yohira/http.abstractions';

import { IHttpMethodMetadata } from '../IHttpMethodMetadata';
import { CandidateSet } from './CandidateSet';
import { IEndpointSelectorPolicy } from './IEndpointSelectorPolicy';
import { INodeBuilderPolicy } from './INodeBuilderPolicy';
import { MatcherPolicy } from './MatcherPolicy';
import { PolicyJumpTable } from './PolicyJumpTable';
import { PolicyJumpTableEdge } from './PolicyJumpTableEdge';
import { PolicyNodeEdge } from './PolicyNodeEdge';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/HttpMethodMatcherPolicy.cs,e1986934a0392a00,references
@typedef(Type.from('HttpMethodMatcherPolicy'), {
	extends: Type.from('MatcherPolicy'),
	implements: [
		Type.from('INodeBuilderPolicy'),
		Type.from('IEndpointSelectorPolicy'),
	],
})
export class HttpMethodMatcherPolicy
	extends MatcherPolicy
	implements INodeBuilderPolicy, IEndpointSelectorPolicy
{
	get order(): number {
		return -1000;
	}

	private static nodeBuilderAppliesToEndpointsCore(
		endpoints: readonly Endpoint[],
	): boolean {
		for (const endpoint of endpoints) {
			const httpMethodMetadata =
				endpoint.metadata.getMetadata<IHttpMethodMetadata>(
					Type.from('IHttpMethodMetadata'),
				);
			if (
				httpMethodMetadata !== undefined &&
				httpMethodMetadata.httpMethods.length > 0
			) {
				return true;
			}
		}

		return false;
	}

	nodeBuilderAppliesToEndpoints(endpoints: readonly Endpoint[]): boolean {
		if (MatcherPolicy.containsDynamicEndpoints(endpoints)) {
			return false;
		}

		return HttpMethodMatcherPolicy.nodeBuilderAppliesToEndpointsCore(
			endpoints,
		);
	}

	endpointSelectorAppliesToEndpoints(
		endpoints: readonly Endpoint[],
	): boolean {
		// When the node contains dynamic endpoints we can't make any assumptions.
		return MatcherPolicy.containsDynamicEndpoints(endpoints);
	}

	apply(httpContext: HttpContext, candidates: CandidateSet): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	getEdges(endpoints: readonly Endpoint[]): readonly PolicyNodeEdge[] {
		// TODO
		throw new Error('Method not implemented.');
	}

	buildJumpTable(
		exitDestination: number,
		edges: readonly PolicyJumpTableEdge[],
	): PolicyJumpTable {
		// TODO
		throw new Error('Method not implemented.');
	}
}
