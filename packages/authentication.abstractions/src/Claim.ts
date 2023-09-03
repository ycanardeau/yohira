// https://source.dot.net/#System.Security.Claims/System/Security/Claims/Claim.cs,52a2b29224ad0a58,references
import { ClaimsIdentity } from './ClaimsIdentity';

/**
 * A Claim is a statement about an entity by an Issuer.
 * A Claim consists of a Type, Value, a Subject and an Issuer.
 * Additional properties, ValueType, Properties and OriginalIssuer help understand the claim when making decisions.
 */
export class Claim {
	constructor(
		type: string,
		value: string,
		valueType?: string,
		issuer?: string,
		originalIssuer?: string,
		subject?: ClaimsIdentity,
		propertyKey?: string,
		propertyValue?: string,
	) {}
}
