/**
 * Options for configuring the behavior for {@link WebApp.createBuilder(WebAppOptions)}.
 */
export class WebAppOptions {
	/**
	 * The command line arguments.
	 */
	/* TODO: readonly */ args: string[] | undefined;
	/**
	 * The environment name.
	 */
	/* TODO: readonly */ envName: string | undefined;
	/**
	 * The application name.
	 */
	/* TODO: readonly */ appName: string | undefined;
	/**
	 * The content root path.
	 */
	/* TODO: readonly */ contentRootPath: string | undefined;
	/**
	 * The web root path.
	 */
	/* TODO: readonly */ webRootPath: string | undefined;
}
