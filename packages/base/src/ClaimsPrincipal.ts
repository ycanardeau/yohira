import { Claim } from './Claim';
import { ClaimsIdentity } from './ClaimsIdentity';
import { IIdentity } from './IIdentity';
import { IPrincipal } from './IPrincipal';

// https://source.dot.net/#System.Security.Claims/System/Security/Claims/ClaimsPrincipal.cs,8193f72fd7c38c41,references
export class ClaimsPrincipal implements IPrincipal {
	readonly identities: ClaimsIdentity[] = [];

	private static identitySelector: (
		identities: Iterable<ClaimsIdentity>,
	) => ClaimsIdentity | undefined = ClaimsPrincipal.selectPrimaryIdentity;

	constructor() {}

	static fromIdentities(
		identities: Iterable<ClaimsIdentity>,
	): ClaimsPrincipal {
		const principal = new ClaimsPrincipal();

		principal.identities.push(...identities);

		return principal;
	}

	static fromIdentity(identity: IIdentity): ClaimsPrincipal {
		const principal = new ClaimsPrincipal();

		if (identity instanceof ClaimsIdentity) {
			principal.identities.push(identity);
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}

		return principal;
	}

	private static selectPrimaryIdentity(
		identities: Iterable<ClaimsIdentity>,
	): ClaimsIdentity | undefined {
		for (const identity of identities) {
			if (identity !== undefined) {
				return identity;
			}
		}

		return undefined;
	}

	get identity(): IIdentity | undefined {
		if (ClaimsPrincipal.identitySelector !== undefined) {
			return ClaimsPrincipal.identitySelector(this.identities);
		} else {
			return ClaimsPrincipal.selectPrimaryIdentity(this.identities);
		}
	}

	addIdentity(identity: ClaimsIdentity): void {
		this.identities.push(identity);
	}

	findFirst(type: string): Claim | undefined {
		let claim: Claim | undefined = undefined;

		for (let i = 0; i < this.identities.length; i++) {
			if (this.identities[i] !== undefined) {
				claim = this.identities[i].findFirst(type);
				if (claim !== undefined) {
					return claim;
				}
			}
		}

		return claim;
	}

	isInRole(role: string): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}
}
