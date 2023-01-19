import { RoutePatternPart } from './RoutePatternPart';
import { RoutePatternPartKind } from './RoutePatternPartKind';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternLiteralPart.cs,47ac60a3471b38ae,references
export class RoutePatternLiteralPart extends RoutePatternPart {
	constructor(readonly content: string) {
		super(RoutePatternPartKind.Literal);

		if (!this.content) {
			throw new Error('Assertion failed.');
		}
	}

	debuggerToString(): string {
		return this.content;
	}
}
