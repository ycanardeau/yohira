import { RoutePatternParameterKind } from './RoutePatternParameterKind';
import { RoutePatternPart } from './RoutePatternPart';
import { RoutePatternPartKind } from './RoutePatternPartKind';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParameterPart.cs,8919ea381b3bb689,references
export class RoutePatternParameterPart extends RoutePatternPart {
	constructor(
		readonly name: string,
		// TODO: default,
		readonly parameterKind: RoutePatternParameterKind,
		// TODO: parameterPolicies
		readonly encodeSlashes = true,
	) {
		super(RoutePatternPartKind.Parameter);
	}

	/**
	 * Returns <c>true</c> if this part is a catch-all parameter.
	 * Otherwise returns <c>false</c>.
	 */
	get isCatchAll(): boolean {
		return this.parameterKind === RoutePatternParameterKind.CatchAll;
	}

	/**
	 * Returns <c>true</c> if this part is an optional parameter.
	 * Otherwise returns <c>false</c>.
	 */
	get isOptional(): boolean {
		return this.parameterKind === RoutePatternParameterKind.Optional;
	}

	debuggerToString(): string {
		const builder: string[] = [];
		builder.push('{');

		if (this.isCatchAll) {
			builder.push('*');
			if (!this.encodeSlashes) {
				builder.push('*');
			}
		}

		builder.push(this.name);

		/* TODO: for (const constraint of this.parameterPolicies) {
			builder.push(':', constraint.parameterPolicy);
		} */

		/* TODO: if (this.default !== undefined) {
			builder.push('=', this.default);
		} */

		if (this.isOptional) {
			builder.push('?');
		}

		builder.push('}');
		return builder.join('');
	}
}
