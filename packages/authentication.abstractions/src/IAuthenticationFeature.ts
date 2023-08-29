import { PathString } from '@yohira/http.abstractions';

export const IAuthenticationFeature = Symbol.for('IAuthenticationFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticationFeature.cs,b09e4a44e6f7b6d8,references
/**
 * Used to capture path info so redirects can be computed properly within an app.Map().
 */
export interface IAuthenticationFeature {
	/**
	 * The original path base.
	 */
	originalPathBase: PathString;
	/**
	 * The original path.
	 */
	originalPath: PathString;
}
