import { HttpContext } from '@yohira/http';
import { Endpoint } from '@yohira/http.abstractions';

import { CandidateSet } from './CandidateSet';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/IEndpointSelectorPolicy.cs,afa6bd128b98ebdb,references
export interface IEndpointSelectorPolicy {
	endpointSelectorAppliesToEndpoints(endpoints: readonly Endpoint[]): boolean;
	apply(httpContext: HttpContext, candidates: CandidateSet): Promise<void>;
}
