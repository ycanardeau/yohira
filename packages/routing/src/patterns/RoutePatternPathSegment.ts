import { RoutePatternPart } from './RoutePatternPart';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternPathSegment.cs,b9356d340e15ae89,references
export class RoutePatternPathSegment {
	constructor(readonly parts: readonly RoutePatternPart[]) {}

	/**
	 * Returns <c>true</c> if the segment contains a single part;
	 * otherwise returns <c>false</c>.
	 */
	get isSimple(): boolean {
		return this.parts.length === 1;
	}

	static debuggerToString(parts: readonly RoutePatternPart[]): string {
		return Array.from(parts)
			.map((part) => part.debuggerToString())
			.join('');
	}

	debuggerToString(): string {
		return RoutePatternPathSegment.debuggerToString(this.parts);
	}
}
