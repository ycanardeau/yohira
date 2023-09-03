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
	private readonly instanceClaims: Claim[] = [];

	static readonly defaultIssuer = 'LOCAL AUTHORITY';

	/**
	 * Initializes an instance of {@link ClaimsIdentity}.
	 * @param identity {@link IIdentity} supplies the {@link name} and {@link authenticationType}.
	 * @param claims {@link Iterable{Claim}} associated with this instance.
	 * @param authenticationType The type of authentication used.
	 * @param nameType The {@link Claim.type} used when obtaining the value of {@link ClaimsIdentity.name}.
	 * @param roleType The {@link Claim.type} used when performing logic for {@link ClaimsPrincipal.isInRole}.
	 */
	constructor(
		identity: IIdentity | undefined,
		claims: Iterable<Claim> | undefined,
		authenticationType: string | undefined,
		nameType: string | undefined,
		roleType: string | undefined,
	) {
		this._authenticationType =
			identity !== undefined && !authenticationType
				? identity.authenticationType
				: authenticationType;
		// TODO

		if (identity instanceof ClaimsIdentity) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			if (identity !== undefined && !!identity.name) {
				// TODO
				throw new Error('Method not implemented.');
			}
		}

		if (claims !== undefined) {
			this.safeAddClaims(claims);
		}
	}

	private safeAddClaims(claims: Iterable<Claim | undefined>): void {
		for (const claim of claims) {
			if (claim === undefined) {
				continue;
			}

			if (claim.subject === this /* REVIEW */) {
				this.instanceClaims.push(claim);
			} else {
				this.instanceClaims.push(claim.clone());
			}
		}
	}

	/**
	 * Gets a value that indicates if the user has been authenticated.
	 */
	get isAuthenticated(): boolean {
		return !!this._authenticationType;
	}

	get name(): string | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}
}
