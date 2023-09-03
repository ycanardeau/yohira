import { ClaimValueTypes } from './ClaimValueTypes';
import { ClaimsIdentity } from './ClaimsIdentity';

// https://source.dot.net/#System.Security.Claims/System/Security/Claims/Claim.cs,52a2b29224ad0a58,references
/**
 * A Claim is a statement about an entity by an Issuer.
 * A Claim consists of a Type, Value, a Subject and an Issuer.
 * Additional properties, ValueType, Properties and OriginalIssuer help understand the claim when making decisions.
 */
export class Claim {
	private readonly userSerializationData: Buffer | undefined;

	readonly issuer: string;
	readonly originalIssuer: string;
	private readonly properties: Map<string, string> | undefined;

	readonly valueType: string;

	constructor(
		readonly type: string,
		readonly value: string,
		valueType?: string,
		issuer?: string,
		originalIssuer?: string,
		readonly subject?: ClaimsIdentity,
		propertyKey?: string,
		propertyValue?: string,
	) {
		this.valueType = !valueType ? ClaimValueTypes.string : valueType;
		this.issuer = !issuer ? ClaimsIdentity.defaultIssuer : issuer;
		this.originalIssuer = !originalIssuer ? this.issuer : originalIssuer;

		if (propertyKey !== undefined) {
			this.properties = new Map();
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.properties.set(propertyKey, propertyValue!);
		}
	}

	protected static fromOther(
		other: Claim,
		subject: ClaimsIdentity | undefined,
	): Claim {
		const claim = new Claim(
			other.type,
			other.value,
			other.valueType,
			other.issuer,
			other.originalIssuer,
			subject,
			undefined,
			undefined,
		);
		if (other.properties !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}
		if (other.userSerializationData !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}

		return claim;
	}

	clone(identity?: ClaimsIdentity): Claim {
		return Claim.fromOther(this, identity);
	}
}
