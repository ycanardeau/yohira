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
