import { IHttpContext, setEndpoint } from '@yohira/http.abstractions';

import { CandidateSet } from './CandidateSet';
import { CandidateState } from './CandidateState';
import { EndpointSelector } from './EndpointSelector';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DefaultEndpointSelector.cs,b31649cd02e6007d,references
export class DefaultEndpointSelector extends EndpointSelector {
	/** @internal */ static select(
		httpContext: IHttpContext,
		candidateState: CandidateState[],
	): void {
		switch (candidateState.length) {
			case 0: {
				// Do nothing
				break;
			}

			case 1: {
				const state = candidateState[0];
				if (CandidateSet.isValidCandidate(state)) {
					setEndpoint(httpContext, state.endpoint);
					// TODO: httpContext.request.routeValues = state.values!;
				}
				break;
			}

			case 2: {
				// TODO
				throw new Error('Method not implemented.');
			}
		}
	}

	select(
		httpContext: IHttpContext,
		candidateSet: CandidateSet,
	): Promise<void> {
		DefaultEndpointSelector.select(httpContext, candidateSet.candidates);
		return Promise.resolve();
	}
}
