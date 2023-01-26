import { CandidateState } from './CandidateState';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/CandidateSet.cs,718ed4434c292456,references
export class CandidateSet {
	constructor(/** @internal */ readonly candidates: CandidateState[]) {}

	get count(): number {
		return this.candidates.length;
	}

	get(index: number): CandidateState {
		if (index >= this.count) {
			throw new Error(/* TODO: message */);
		}

		return this.candidates[index];
	}

	/** @internal */ static isValidCandidate(
		candidate: CandidateState,
	): boolean {
		return candidate.score >= 0;
	}

	isValidCandidate(index: number): boolean {
		if (index >= this.count) {
			throw new Error(/* TODO: message */);
		}

		return CandidateSet.isValidCandidate(this.candidates[index]);
	}

	/** @internal */ static setValidity(
		candidate: CandidateState,
		value: boolean,
	): void {
		const originalScore = candidate.score;
		const score =
			originalScore >= 0 !== value ? ~originalScore : originalScore;
		candidate = new CandidateState(
			candidate.endpoint,
			// TODO: candidate.values,
			score,
		);
	}

	setValidity(index: number, value: boolean): void {
		if (index >= this.count) {
			throw new Error(/* TODO: message */);
		}

		const original = this.candidates[index];
		CandidateSet.setValidity(original, value);
	}
}
