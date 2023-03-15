import { IRequestCookieCollection } from './IRequestCookieCollection';

export const IRequestCookiesFeature = Symbol.for('IRequestCookiesFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IRequestCookiesFeature.cs,82c7cfdc26314acb,references
/**
 * Provides access to request cookie collection.
 */
export interface IRequestCookiesFeature {
	/**
	 * Gets or sets the request cookies.
	 */
	cookies: IRequestCookieCollection;
}
