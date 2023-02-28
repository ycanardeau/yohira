// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationProperties.cs,07bee9fb5619ff86
/**
 * Dictionary used to store state values about the authentication session.
 */
export class AuthenticationProperties {
	/**
	 * State values about the authentication session.
	 */
	readonly items: Map<string, string | undefined>;

	/**
	 * Collection of parameters that are passed to the authentication handler. These are not intended for
	 * serialization or persistence, only for flowing data between call sites.
	 */
	readonly parameters: Map<string, object | undefined>;

	constructor(
		items: Map<string, string | undefined> | undefined,
		parameters: Map<string, object | undefined> | undefined,
	) {
		this.items = items ?? new Map();
		this.parameters = parameters ?? new Map();
	}
}
