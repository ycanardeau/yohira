import { Endpoint } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/Candidate.cs,f68cdef97cda198e,references
export enum CandidateFlags {
	None = 0,
	HasDefaults = 1,
	HasCaptures = 2,
	HasCatchAll = 4,
	HasSlots = HasDefaults | HasCaptures | HasCatchAll,
	HasComplexSegments = 8,
	HasConstraints = 16,
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/Candidate.cs,ac474f030c0ed515,references
export class Candidate {
	readonly flags: CandidateFlags;

	constructor(
		readonly endpoint: Endpoint,
		readonly score: number, // TODO: slots, captures, catchAll, complexSegments, constraints
	) {
		this.flags = CandidateFlags.None;
		// TODO

		// TODO
	}
}
