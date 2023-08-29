export class AuthenticationScheme {
	/**
	 * Initializes a new instance of {@link AuthenticationScheme}.
	 * @param name The name for the authentication scheme.
	 * @param displayName The display name for the authentication scheme.
	 */
	constructor(
		/**
		 * The name of the authentication scheme.
		 */
		readonly name: string,
		/**
		 * The display name for the scheme. Undefined is valid and used for non user facing schemes.
		 */
		readonly displayName: string | undefined /* TODO: handlerType */,
	) {}
}
