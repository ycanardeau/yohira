// https://source.dot.net/#Microsoft.AspNetCore.Antiforgery/AntiforgeryTokenSet.cs,b54b91c61d6c1fb8,references
/**
 * The antiforgery token pair (cookie and request token) for a request.
 */
export class AntiforgeryTokenSet {
	constructor(
		/**
		 * Gets the request token.
		 */
		readonly requestToken: string | undefined,
		/**
		 * Gets the cookie token.
		 */
		readonly cookieToken: string | undefined,
		/**
		 * Gets the name of the form field used for the request token.
		 */
		readonly formFieldName: string,
		/**
		 * Gets the name of the header used for the request token.
		 */
		readonly headerName: string | undefined,
	) {}
}
