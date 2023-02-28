import { IIdentity } from './IIdentity';
import { IPrincipal } from './IPrincipal';

// https://source.dot.net/#System.Security.Claims/System/Security/Claims/ClaimsPrincipal.cs,8193f72fd7c38c41,references
export class ClaimsPrincipal implements IPrincipal {
	get identity(): IIdentity | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	isInRole(role: string): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}
}
