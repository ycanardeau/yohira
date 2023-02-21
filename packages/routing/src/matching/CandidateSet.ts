import { Endpoint } from '@yohira/http.abstractions';

import { CandidateState } from './CandidateState';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/CandidateSet.cs,718ed4434c292456,references
export class CandidateSet {
	constructor(/** @internal */ readonly candidates: CandidateState[]) {}

	static fromEndpoints(
		endpoints: Endpoint[],
		// TODO: values: RouteValueDictionary[],
		scores: number[],
	): CandidateSet {
		if (/* TODO */ endpoints.length !== scores.length) {
			throw new Error(
				`The provided endpoints, values, and scores must have the same length.`,
			);
		}

		return new CandidateSet(
			[...Array(endpoints.length).keys()].map(
				(i) =>
					new CandidateState(
						endpoints[i],
						// TODO: values[i],
						scores[i],
					),
			),
		);
	}

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
		candidate: {
			get: () => CandidateState;
			set: (value: CandidateState) => void;
		},
		value: boolean,
	): void {
		const originalScore = candidate.get().score;
		const score =
			originalScore >= 0 !== value ? ~originalScore : originalScore;
		candidate.set(
			new CandidateState(
				candidate.get().endpoint,
				// TODO: candidate.values,
				score,
			),
		);
	}

	setValidity(index: number, value: boolean): void {
		if (index >= this.count) {
			throw new Error(/* TODO: message */);
		}

		CandidateSet.setValidity(
			{
				get: () => this.candidates[index],
				set: (value) => (this.candidates[index] = value),
			},
			value,
		);
	}
}
