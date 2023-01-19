// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternPartKind.cs,8de5ef52463c90d0,references
/**
 * Defines the kinds of {@link RoutePatternPart} instances.
 */
export enum RoutePatternPartKind {
	/**
	 * The {@link RoutePatternPartKind} of a {@link RoutePatternLiteralPart}.
	 */
	Literal,

	/**
	 * The {@link RoutePatternPartKind} of a {@link RoutePatternParameterPart}.
	 */
	Parameter,

	/**
	 * The {@link RoutePatternPartKind} of a {@link RoutePatternSeparatorPart}.
	 */
	Separator,
}
