import {
	ILogger,
	ILoggerT,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

import { Candidate } from './Candidate';
import { DfaState } from './DfaState';
import { EndpointSelector } from './EndpointSelector';
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

	constructor(
		logger: ILoggerT<DfaMatcher>,
		private readonly selector: EndpointSelector,
		private readonly states: DfaState[],
		private readonly maxSegmentCount: number,
	) {
		super();

		this.logger = logger;
	}

	/** @internal */ findCandidateSet(
		httpContext: IHttpContext,
		path: string,
		// TODO: segments: ReadonlySpan<PathSegment>,
	): {
		candidates: Candidate[];
		policies: IEndpointSelectorPolicy[];
	} {
		return { candidates: [] /* TODO */, policies: [] /* TODO */ };
	}

	private async selectEndpointWithPolicies(
		httpContext: IHttpContext,
		// TODO: policies: IEndpointSelectorPolicy[],
		// TODO: candidateSet: CandidateSet,
	): Promise<void> {
		// TODO
	}

	match(httpContext: IHttpContext): Promise<void> {
		const log = this.logger.isEnabled(LogLevel.Debug);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const path = httpContext.request.path.value!;

		// TODO

		const { candidates, policies } = this.findCandidateSet(
			httpContext,
			path,
			// TODO: segments,
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

		// TODO

		return this.selectEndpointWithPolicies(httpContext /* TODO */);
	}
}
