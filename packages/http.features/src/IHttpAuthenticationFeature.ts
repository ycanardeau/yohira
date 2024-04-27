import { ClaimsPrincipal } from '@yohira/base';

export const IHttpAuthenticationFeature = Symbol.for(
	'IHttpAuthenticationFeature',
);
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/Authentication/IHttpAuthenticationFeature.cs,5bcd7fb12e0dffdd,references
/**
 * The HTTP authentication feature.
 */
export interface IHttpAuthenticationFeature {
	/**
	 * Gets or sets the {@link ClaimsPrincipal} associated with the HTTP request.
	 */
	user: ClaimsPrincipal | undefined;
}
