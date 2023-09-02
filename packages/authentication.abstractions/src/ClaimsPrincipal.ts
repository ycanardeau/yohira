import { ClaimsIdentity } from './ClaimsIdentity';
import { IIdentity } from './IIdentity';
import { IPrincipal } from './IPrincipal';

// https://source.dot.net/#System.Security.Claims/System/Security/Claims/ClaimsPrincipal.cs,8193f72fd7c38c41,references
export class ClaimsPrincipal implements IPrincipal {
	private readonly identities: ClaimsIdentity[] = [];

	private constructor() {}

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

	get identity(): IIdentity | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	isInRole(role: string): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}
}
