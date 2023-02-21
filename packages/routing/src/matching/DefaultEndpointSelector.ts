import { Endpoint, IHttpContext, setEndpoint } from '@yohira/http.abstractions';

import { CandidateSet } from './CandidateSet';
import { CandidateState } from './CandidateState';
import { EndpointSelector } from './EndpointSelector';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DefaultEndpointSelector.cs,b31649cd02e6007d,references
export class DefaultEndpointSelector extends EndpointSelector {
	private static reportAmbiguity(candidateState: CandidateState[]): void {
		// If we get here it's the result of an ambiguity - we're OK with this
		// being a littler slower and more allocatey.
		const matches: Endpoint[] = [];
		for (let i = 0; i < candidateState.length; i++) {
			const state = candidateState[i];
			if (CandidateSet.isValidCandidate(state)) {
				matches.push(state.endpoint);
			}
		}

		const message = `The request matched multiple endpoints. Matches: \n\n${matches
			.map((e) => e.displayName)
			.join('\n')}`;
		throw new Error(message);
	}

	private static processFinalCandidates(
		httpContext: IHttpContext,
		candidateState: CandidateState[],
	): void {
		let endpoint: Endpoint | undefined = undefined;
		// TODO: values
		let foundScore: number | undefined = undefined;
		for (let i = 0; i < candidateState.length; i++) {
			const state = candidateState[i];
			if (!CandidateSet.isValidCandidate(state)) {
				continue;
			}

			if (foundScore === undefined) {
				// This is the first match we've seen - speculatively assign it.
				endpoint = state.endpoint;
				//values = state.values;
				foundScore = state.score;
			} else if (foundScore < state.score) {
				// This candidate is lower priority than the one we've seen
				// so far, we can stop.
				//
				// Don't worry about the 'null < state.Score' case, it returns false.
				break;
			} else if (foundScore === state.score) {
				// This is the second match we've found of the same score, so there
				// must be an ambiguity.
				//
				// Don't worry about the 'null == state.Score' case, it returns false.

				DefaultEndpointSelector.reportAmbiguity(candidateState);

				// Unreachable, ReportAmbiguity always throws.
				throw new Error('Method not supported.');
			}
		}

		if (endpoint !== undefined) {
			setEndpoint(httpContext, endpoint);
			// TODO: httpContext.request.routeValues = values!;
		}
	}

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

			default: {
				// Slow path: There's more than one candidate (to say nothing of validity) so we
				// have to process for ambiguities.
				DefaultEndpointSelector.processFinalCandidates(
					httpContext,
					candidateState,
				);
				break;
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
