// https://github.com/dotnet/aspire/blob/e3fc7cc96166078b27ba9e63558761ef265a2fcd/src/Aspire.Hosting/ApplicationModel/EnvironmentCallbackContext.cs#L11
/**
 * Represents a callback context for environment variables associated with a publisher.
 */
export class EnvCallbackContext {
	/**
	 *
	 * @param publisherName The name of the publisher.
	 * @param envVariables The environment variables associated with the publisher.
	 */
	constructor(
		/**
		 * Gets the name of the publisher associated with the callback context.
		 */
		readonly publisherName: string,
		/**
		 * Gets the environment variables associated with the callback context.
		 */
		readonly envVariables: Map<string, string> = new Map(),
	) {}
}
