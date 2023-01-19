/**
 * Defines the kinds of {@link RoutePatternParameterPart} instances.
 */
export enum RoutePatternParameterKind {
	/**
	 * The {@link RoutePatternParameterKind} of a standard parameter
	 * without optional or catch all behavior.
	 */
	Standard,

	/**
	 * The {@link RoutePatternParameterKind} of an optional parameter.
	 */
	Optional,

	/**
	 * The {@link RoutePatternParameterKind} of a catch-all parameter.
	 */
	CatchAll,
}
