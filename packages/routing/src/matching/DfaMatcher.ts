import {
	ILogger,
	ILoggerT,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';

import { DfaState } from './DfaState';
import { EndpointSelector } from './EndpointSelector';
import { Matcher } from './Matcher';

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

	private async selectEndpointWithPolicies(
		httpContext: IHttpContext,
		// TODO: policies: IEndpointSelectorPolicy[],
		// TODO: candidateSet: CandidateSet,
	): Promise<void> {
		// TODO
	}

	match(httpContext: IHttpContext): Promise<void> {
		const log = this.logger.isEnabled(LogLevel.Debug);

		const path = httpContext.request.path.value;

		// TODO

		return this.selectEndpointWithPolicies(httpContext /* TODO */);
	}
}
