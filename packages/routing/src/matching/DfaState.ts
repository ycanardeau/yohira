import { Candidate } from './Candidate';
import { IEndpointSelectorPolicy } from './IEndpointSelectorPolicy';
import { JumpTable } from './JumpTable';
import { PolicyJumpTable } from './PolicyJumpTable';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaState.cs,45d2de17c8b4cdd3,references
export class DfaState {
	constructor(
		readonly candidates: Candidate[],
		readonly policies: IEndpointSelectorPolicy,
		readonly pathTransitions: JumpTable,
		readonly policyTransitions: PolicyJumpTable,
	) {}

	debuggerToString(): string {
		return `matches: ${
			this.candidates.length
		}, path: (${this.pathTransitions.debuggerToString()}), policy: (${this.policyTransitions.debuggerToString()})`;
	}
}
