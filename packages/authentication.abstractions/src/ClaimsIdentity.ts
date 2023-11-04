import { Claim } from './Claim';
import { ClaimTypes } from './ClaimTypes';
import { IIdentity } from './IIdentity';

// https://source.dot.net/#System.Security.Claims/System/Security/Claims/ClaimsIdentity.cs,8437a543724aff81,references
/**
 * An Identity that is represented by a set of claims.
 */
export class ClaimsIdentity implements IIdentity {
	isCircular(subject: ClaimsIdentity): boolean {
		if (this === subject) {
			return true;
		}

		let currSubject = subject;

		while (currSubject.actor !== undefined) {
			if (this === currSubject.actor) {
				return true;
			}

			currSubject = currSubject.actor;
		}

		return false;
	}

	private _actor: ClaimsIdentity | undefined;
	get actor(): ClaimsIdentity | undefined {
		return this._actor;
	}
	set actor(value: ClaimsIdentity | undefined) {
		if (value !== undefined) {
			if (this.isCircular(value)) {
				throw new Error(
					'An Actor must not create a circular reference between itself (or one of its child Actors) and one of its parents.' /* LOC */,
				);
			}
		}
		this._actor = value;
	}

	private _authenticationType: string | undefined;
	get authenticationType(): string | undefined {
		return this._authenticationType;
	}
	bootstrapContext: unknown /* TODO */ | undefined;
	private externalClaims: Claim[][] | undefined;
	private readonly instanceClaims: Claim[] = [];
	readonly nameClaimType = ClaimsIdentity.defaultNameClaimType;
	readonly roleClaimType = ClaimsIdentity.defaultRoleClaimType;

	static readonly defaultIssuer = 'LOCAL AUTHORITY';
	static readonly defaultNameClaimType = ClaimTypes.name;
	static readonly defaultRoleClaimType = ClaimTypes.role;

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

	private *combinedClaimsIterator(): Generator<Claim> {
		for (let i = 0; i < this.instanceClaims.length; i++) {
			yield this.instanceClaims[i];
		}

		const externalClaims = this.externalClaims!;
		for (let j = 0; j < externalClaims.length; j++) {
			if (externalClaims[j] !== undefined) {
				for (const claim of externalClaims[j]) {
					yield claim;
				}
			}
		}
	}

	get claims(): Iterable<Claim> {
		if (this.externalClaims === undefined) {
			return this.instanceClaims;
		}

		return this.combinedClaimsIterator();
	}

	addClaim(claim: Claim): void {
		if (claim.subject === this) {
			this.instanceClaims.push(claim);
		} else {
			this.instanceClaims.push(claim.clone(this));
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

	findFirst(type: string): Claim | undefined {
		for (const claim of this.claims) {
			if (claim !== undefined) {
				if (claim.type.toLowerCase() === type.toLowerCase()) {
					return claim;
				}
			}
		}

		return undefined;
	}

	// just an accessor for getting the name claim
	get name(): string | undefined {
		const claim = this.findFirst(this.nameClaimType);
		if (claim !== undefined) {
			return claim.value;
		}

		return undefined;
	}
}
