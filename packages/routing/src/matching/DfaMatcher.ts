import {
	ILogger,
	ILoggerT,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IHttpContext, setEndpoint } from '@yohira/http.abstractions';

import { Candidate, CandidateFlags } from './Candidate';
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
		const { states } = this;

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
		// TODO: policies: IEndpointSelectorPolicy[],
		// TODO: candidateSet: CandidateSet,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
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
			if (true /* TODO: candidate.flags === CandidateFlags.None */) {
				setEndpoint(httpContext, candidate.endpoint);

				// We're done
				return Promise.resolve();
			}
		}

		// TODO

		return this.selectEndpointWithPolicies(httpContext /* TODO */);
	}
}
