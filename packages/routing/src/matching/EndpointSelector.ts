import { IHttpContext } from '@yohira/http.abstractions';

import { CandidateSet } from './CandidateSet';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/EndpointSelector.cs,dd806bad95212405,references
export abstract class EndpointSelector {
	abstract select(
		httpContext: IHttpContext,
		candidates: CandidateSet,
	): Promise<void>;
}
