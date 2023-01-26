import { Endpoint } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/CandidateState.cs,43f4b94d6f4f0421,references
/**
 * The state associated with a candidate in a {@link CandidateSet}.
 */
export class CandidateState {
	constructor(readonly endpoint: Endpoint, readonly score: number) {}
}
