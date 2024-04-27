import { ClaimsPrincipal } from '@yohira/base';

export const IClaimsTransformation = Symbol.for('IClaimsTransformation');
// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IClaimsTransformation.cs,f6764fe1eb80a8a1,references
/**
 * Used by the {@link IAuthenticationService} for claims transformation.
 */
export interface IClaimsTransformation {
	/**
	 * Provides a central transformation point to change the specified principal.
	 * Note: this will be run on each authenticate call, so its safer to
	 * return a new ClaimsPrincipal if your transformation is not idempotent.
	 * @param principal The {@link ClaimsPrincipal} to transform.
	 * @returns The transformed principal.
	 */
	transform(principal: ClaimsPrincipal): Promise<ClaimsPrincipal>;
}
