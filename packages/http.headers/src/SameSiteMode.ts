// https://source.dot.net/#Microsoft.Net.Http.Headers/SameSiteMode.cs,3f412ac98c8dcdcc,references
/**
 * Indicates if the client should include a cookie on "same-site" or "cross-site" requests.
 * RFC Draft: <see href="https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.1"/>
 */
// This mirrors Microsoft.AspNetCore.Http.SameSiteMode
export enum SameSiteMode {
	/**
	 * No SameSite field will be set, the client should follow its default cookie policy.
	 */
	Unspecified = -1,
	/**
	 * Indicates the client should disable same-site restrictions.
	 */
	None = 0,
	/**
	 * Indicates the client should send the cookie with "same-site" requests, and with "cross-site" top-level navigations.
	 */
	Lax,
	/**
	 * Indicates the client should only send the cookie with "same-site" requests.
	 */
	Strict,
}
