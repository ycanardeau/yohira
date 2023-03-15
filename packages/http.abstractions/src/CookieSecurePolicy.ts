// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/CookieSecurePolicy.cs,7e60cea7095e50df,references
/**
 * Determines how cookie security properties are set.
 */
export enum CookieSecurePolicy {
	/**
	 * If the URI that provides the cookie is HTTPS, then the cookie will only be returned to the server on
	 * subsequent HTTPS requests. Otherwise if the URI that provides the cookie is HTTP, then the cookie will
	 * be returned to the server on all HTTP and HTTPS requests. This value ensures
	 * HTTPS for all authenticated requests on deployed servers, and also supports HTTP for localhost development
	 * and for servers that do not have HTTPS support.
	 */
	SameAsRequest,
	/**
	 * Secure is always marked true. Use this value when your login page and all subsequent pages
	 * requiring the authenticated identity are HTTPS. Local development will also need to be done with HTTPS urls.
	 */
	Always,
	/**
	 * Secure is not marked true. Use this value when your login page is HTTPS, but other pages
	 * on the site which are HTTP also require authentication information. This setting is not recommended because
	 * the authentication information provided with an HTTP request may be observed and used by other computers
	 * on your local network or wireless connection.
	 */
	None,
}
