import { IResponseCookies } from './IResponseCookies';

export const IResponseCookiesFeature = Symbol.for('IResponseCookiesFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IResponseCookiesFeature.cs,92545763c00945b0,references
/**
 * A helper for creating the response Set-Cookie header.
 */
export interface IResponseCookiesFeature {
	/**
	 * Gets the wrapper for the response Set-Cookie header.
	 */
	readonly cookies: IResponseCookies;
}
