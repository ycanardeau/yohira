import { IClaimsTransformation } from '@yohira/authentication.abstractions';
import { ClaimsPrincipal } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Core/NoopClaimsTransformation.cs,6320ffc78137554d,references
/**
 * Default claims transformation is a no-op.
 */
export class NoopClaimsTransformation implements IClaimsTransformation {
	/**
	 * Returns the principal unchanged.
	 * @param principal The user.
	 * @returns The principal unchanged.
	 */
	transform(principal: ClaimsPrincipal): Promise<ClaimsPrincipal> {
		return Promise.resolve(principal);
	}
}
