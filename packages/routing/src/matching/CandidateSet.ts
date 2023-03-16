import { Ref } from '@yohira/base';
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

	get(index: number): Ref<CandidateState> {
		if (index >= this.count) {
			throw new Error(/* TODO: message */);
		}

		return {
			get: () => this.candidates[index],
			set: (value) => (this.candidates[index] = value),
		};
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
		candidate: Ref<CandidateState>,
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

	replaceEndpoint(
		index: number,
		endpoint: Endpoint | undefined,
		// TODO: values: RouteValueDictionary | undefined,
	): void {
		if (index >= this.count) {
			throw new Error(/* TODO: message */);
		}

		// CandidateState allows a null-valued endpoint. However a validate candidate should never have a null endpoint
		// We'll make lives easier for matcher policies by declaring it as non-null.
		this.candidates[index] = new CandidateState(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			endpoint!,
			// TODO: values,
			this.candidates[index].score,
		);

		if (endpoint === undefined) {
			this.setValidity(index, false);
		}
	}
}
