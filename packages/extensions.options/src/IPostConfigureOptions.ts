/**
 * Represents something that configures the TOptions type.
 *  Note: These are run after all {@link IConfigureOptions{TOptions}}.
 */
export interface IPostConfigureOptions<TOptions> {
	/**
	 * Invoked to configure a TOptions instance.
	 * @param name The name of the options instance being configured.
	 * @param options The options instance to configured.
	 */
	postConfigure(name: string | undefined, options: TOptions): void;
}
