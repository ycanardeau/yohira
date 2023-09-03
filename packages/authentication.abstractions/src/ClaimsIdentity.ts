import { Claim } from './Claim';
import { IIdentity } from './IIdentity';

// https://source.dot.net/#System.Security.Claims/System/Security/Claims/ClaimsIdentity.cs,8437a543724aff81,references
/**
 * An Identity that is represented by a set of claims.
 */
export class ClaimsIdentity implements IIdentity {
	private _authenticationType: string | undefined;
	get authenticationType(): string | undefined {
		return this._authenticationType;
	}

	constructor(
		identity: IIdentity | undefined,
		claims: Iterable<Claim> | undefined,
		authenticationType: string | undefined,
		nameType: string | undefined,
		roleType: string | undefined,
	) {}

	get isAuthenticated(): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}

	get name(): string | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}
}
