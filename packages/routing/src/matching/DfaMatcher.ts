import {
	ILogger,
	ILoggerT,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import {
	Endpoint,
	IHttpContext,
	getEndpoint,
	setEndpoint,
} from '@yohira/http.abstractions';

import { RouteEndpoint } from '../RouteEndpoint';
import { Candidate, CandidateFlags } from './Candidate';
import { CandidateSet } from './CandidateSet';
import { CandidateState } from './CandidateState';
import { DefaultEndpointSelector } from './DefaultEndpointSelector';
import { DfaState } from './DfaState';
import { EndpointSelector } from './EndpointSelector';
import { tokenize } from './FastPathTokenizer';
import { IEndpointSelectorPolicy } from './IEndpointSelectorPolicy';
import { Matcher } from './Matcher';
import { PathSegment } from './PathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcher.cs,869c9d9580778712,references
function logCandidatesNotFound(logger: ILogger, path: string): void {
	logger.log(
		LogLevel.Debug,
		`No candidates found for the request path '${path}'`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcher.cs,6a9bde9741b306d0,references
function logCandidatesFoundCore(
	logger: ILogger,
	candidateCount: number,
	path: string,
): void {
	logger.log(
		LogLevel.Debug,
		`${candidateCount} candidate(s) found for the request path '${path}'`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcher.cs,b938a6912f391be1,references
function logCandidatesFound(
	logger: ILogger,
	path: string,
	candidates: Candidate[],
): void {
	logCandidatesFoundCore(logger, candidates.length, path);
}

function getRoutePattern(endpoint: Endpoint): string {
	const rawText =
		endpoint instanceof RouteEndpoint
			? endpoint.routePattern.rawText
			: undefined;
	return rawText ?? '(none)';
}

function logCandidateValidCore(
	logger: ILogger,
	endpoint: string | undefined,
	routePattern: string,
	path: string,
): void {
	logger.log(
		LogLevel.Debug,
		`Endpoint '${endpoint}' with route pattern '${routePattern}' is valid for the request path '${path}'`,
	);
}

function logCandidateValid(
	logger: ILogger,
	path: string,
	endpoint: Endpoint,
): void {
	// This can be the fallback value because it really might not be a route endpoint
	if (logger.isEnabled(LogLevel.Debug)) {
		const routePattern = getRoutePattern(endpoint);
		logCandidateValidCore(logger, endpoint.displayName, routePattern, path);
	}
}

function logCandidateNotValidCore(
	logger: ILogger,
	endpoint: string | undefined,
	routePattern: string,
	path: string,
): void {
	logger.log(
		LogLevel.Debug,
		`Endpoint '${endpoint}' with route pattern '${routePattern}' is not valid for the request path '${path}'`,
	);
}

function logCandidateNotValid(
	logger: ILogger,
	path: string,
	endpoint: Endpoint,
): void {
	// This can be the fallback value because it really might not be a route endpoint
	if (logger.isEnabled(LogLevel.Debug)) {
		const routePattern = getRoutePattern(endpoint);
		logCandidateNotValidCore(
			logger,
			endpoint.displayName,
			routePattern,
			path,
		);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcher.cs,0b08e610bec2cfbc,references
export class DfaMatcher extends Matcher {
	private readonly logger: ILogger;
	private readonly isDefaultEndpointSelector: boolean;

	constructor(
		logger: ILoggerT<DfaMatcher>,
		private readonly selector: EndpointSelector,
		private readonly states: DfaState[],
		private readonly maxSegmentCount: number,
	) {
		super();

		this.logger = logger;
		this.isDefaultEndpointSelector =
			selector instanceof DefaultEndpointSelector;
	}

	/** @internal */ findCandidateSet(
		httpContext: IHttpContext,
		path: string,
		segments: readonly PathSegment[] /* TODO: ReadonlySpan<PathSegment> */,
	): {
		candidates: Candidate[];
		policies: IEndpointSelectorPolicy[];
	} {
		const states = this.states;

		// Process each path segment
		let destination = 0;
		for (const segment of segments) {
			destination = states[destination].pathTransitions.getDestination(
				path,
				segment,
			);
		}

		// Process an arbitrary number of policy-based decisions
		let policyTransitions = states[destination].policyTransitions;
		while (policyTransitions !== undefined) {
			destination = policyTransitions.getDestination(httpContext);
			policyTransitions = states[destination].policyTransitions;
		}

		return {
			candidates: states[destination].candidates,
			policies: states[destination].policies,
		};
	}

	private async selectEndpointWithPolicies(
		httpContext: IHttpContext,
		policies: IEndpointSelectorPolicy[],
		candidateSet: CandidateSet,
	): Promise<void> {
		for (const policy of policies) {
			await policy.apply(httpContext, candidateSet);
			if (getEndpoint(httpContext) !== undefined) {
				// This is a short circuit, the selector chose an endpoint.
				return;
			}
		}

		await this.selector.select(httpContext, candidateSet);
	}

	match(httpContext: IHttpContext): Promise<void> {
		const log = this.logger.isEnabled(LogLevel.Debug);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const path = httpContext.request.path.value!;

		const buffer: PathSegment[] = new Array(this.maxSegmentCount);
		const count = tokenize(path, buffer);
		const segments = buffer.slice(0, count);

		const { candidates, policies } = this.findCandidateSet(
			httpContext,
			path,
			segments,
		);
		const candidateCount = candidates.length;
		if (candidateCount === 0) {
			if (log) {
				logCandidatesNotFound(this.logger, path);
			}

			return Promise.resolve();
		}

		if (log) {
			logCandidatesFound(this.logger, path, candidates);
		}

		const policyCount = policies.length;

		// This is a fast path for single candidate, 0 policies and default selector
		if (
			candidateCount === 1 &&
			policyCount === 0 &&
			this.isDefaultEndpointSelector
		) {
			const candidate = candidates[0];

			// Just strict path matching (no route values)
			if (candidate.flags === CandidateFlags.None) {
				setEndpoint(httpContext, candidate.endpoint);

				// We're done
				return Promise.resolve();
			}
		}

		// At this point we have a candidate set, defined as a list of endpoints in
		// priority order.
		//
		// We don't yet know that any candidate can be considered a match, because
		// we haven't processed things like route constraints and complex segments.
		//
		// Now we'll iterate each endpoint to capture route values, process constraints,
		// and process complex segments.

		// `candidates` has all of our internal state that we use to process the
		// set of endpoints before we call the EndpointSelector.
		//
		// `candidateSet` is the mutable state that we pass to the EndpointSelector.
		const candidateState: CandidateState[] = new Array(candidateCount);

		for (let i = 0; i < candidateCount; i++) {
			const candidate = candidates[i];
			candidateState[i] = new CandidateState(
				candidate.endpoint,
				candidate.score,
			);

			const flags = candidate.flags;

			// First process all of the parameters and defaults.
			if ((flags & CandidateFlags.HasSlots) !== 0) {
				// TODO
				throw new Error('Method not implemented.');
			}

			// Now that we have the route values, we need to process complex segments.
			// Complex segments go through an old API that requires a fully-materialized
			// route value dictionary.
			const isMatch = true;
			if ((flags & CandidateFlags.HasComplexSegments) !== 0) {
				// TODO
				throw new Error('Method not implemented.');
			}

			if ((flags & CandidateFlags.HasConstraints) !== 0) {
				// TODO
				throw new Error('Method not implemented.');
			}

			if (log) {
				if (isMatch) {
					logCandidateValid(this.logger, path, candidate.endpoint);
				} else {
					logCandidateNotValid(this.logger, path, candidate.endpoint);
				}
			}
		}

		if (policyCount === 0 && this.isDefaultEndpointSelector) {
			DefaultEndpointSelector.select(httpContext, candidateState);
			return Promise.resolve();
		} else if (policyCount === 0) {
			return this.selector.select(
				httpContext,
				new CandidateSet(candidateState),
			);
		}

		return this.selectEndpointWithPolicies(
			httpContext,
			policies,
			new CandidateSet(candidateState),
		);
	}
}
