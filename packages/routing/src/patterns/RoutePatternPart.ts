import { RoutePatternPartKind } from './RoutePatternPartKind';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternPart.cs,df9cc3da81270c0f,references
/**
 * Represents a part of a route pattern.
 */
export abstract class RoutePatternPart {
	protected constructor(readonly partKind: RoutePatternPartKind) {}

	/**
	 * Returns <c>true</c> if this part is literal text. Otherwise returns <c>false</c>.
	 */
	get isLiteral(): boolean {
		return this.partKind === RoutePatternPartKind.Literal;
	}

	/**
	 * Returns <c>true</c> if this part is a route parameter. Otherwise returns <c>false</c>.
	 */
	get isParameter(): boolean {
		return this.partKind === RoutePatternPartKind.Parameter;
	}

	/**
	 * Returns <c>true</c> if this part is an optional separator. Otherwise returns <c>false</c>.
	 */
	get isSeparator(): boolean {
		return this.partKind === RoutePatternPartKind.Separator;
	}

	abstract debuggerToString(): string;
}
