import { RoutePatternPart } from './RoutePatternPart';
import { RoutePatternPartKind } from './RoutePatternPartKind';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternSeparatorPart.cs,d8ff4edc9fa07cdb,references
export class RoutePatternSeparatorPart extends RoutePatternPart {
	constructor(readonly content: string) {
		super(RoutePatternPartKind.Separator);

		if (!content) {
			throw new Error('Assertion failed.');
		}
	}

	debuggerToString(): string {
		return this.content;
	}
}
