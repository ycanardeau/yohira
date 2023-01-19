import { List, replaceAll } from '@yohira/base';

import { parseRouteParameter } from './RouteParameterParser';
import { RoutePattern } from './RoutePattern';
import {
	createLiteralPart,
	createPattern,
	createSeparatorPart,
} from './RoutePatternFactory';
import { RoutePatternLiteralPart } from './RoutePatternLiteralPart';
import { RoutePatternParameterPart } from './RoutePatternParameterPart';
import { RoutePatternPart } from './RoutePatternPart';
import { RoutePatternPathSegment } from './RoutePatternPathSegment';

const separator = '/';
const openBrace = '{';
const closeBrace = '}';
const questionMark = '?';
const periodString = '.';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,5b0c79dbe4256546,references
function trimPrefix(routePattern: string): string {
	if (routePattern.startsWith('~/')) {
		return routePattern.substring(2);
	} else if (routePattern.startsWith('/')) {
		return routePattern.substring(1);
	} else if (routePattern.startsWith('~')) {
		throw new Error(
			"The route template cannot start with a '~' character unless followed by a '/'." /* LOC */,
		);
	}
	return routePattern;
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,7fb8faec81aa82ba,references
class Context {
	index: number;
	private _mark?: number;

	error!: string;

	constructor(private readonly template: string) {
		this.index = -1;
	}

	get current(): string {
		return this.index < this.template.length && this.index >= 0
			? this.template[this.index]
			: '' /* REVIEW */;
	}

	back(): boolean {
		return --this.index >= 0;
	}

	atEnd(): boolean {
		return this.index >= this.template.length;
	}

	moveNext(): boolean {
		return ++this.index < this.template.length;
	}

	mark(): void {
		if (this.index < 0) {
			throw new Error('Method not implemented.');
		}

		this._mark = this.index;
	}

	capture(): string | undefined {
		if (this._mark !== undefined) {
			const value = this.template.substring(this._mark, this.index);
			this._mark = undefined;
			return value;
		} else {
			return undefined;
		}
	}

	debuggerToString(): string {
		if (this.index === -1) {
			return this.template;
		} else if (this._mark !== undefined) {
			return (
				this.template.substring(0, this._mark) +
				'|' +
				this.template.substring(this._mark, this.index) +
				'|' +
				this.template.substring(this.index)
			);
		} else {
			return [
				this.template.substring(0, this.index),
				'|',
				this.template.substring(this.index),
			].join('');
		}
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,b78c7dbe396faeb8,references
function isValidLiteral(context: Context, literal: string): boolean {
	if (literal.indexOf(questionMark) !== -1) {
		context.error = `The literal section '${literal}' is invalid. Literal sections cannot contain the '?' character.`;
		return false;
	}

	return true;
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,f3745786b40fe20f,references
function parseLiteral(context: Context, parts: RoutePatternPart[]): boolean {
	context.mark();

	while (true) {
		if (context.current === separator) {
			// End of the segment
			break;
		} else if (context.current === openBrace) {
			if (!context.moveNext()) {
				// This is a dangling open-brace, which is not allowed
				context.error =
					"There is an incomplete parameter in the route template. Check that each '{' character has a matching '}' character."; /* LOC */
				return false;
			}

			if (context.current === openBrace) {
				// This is an 'escaped' brace in a literal, like "{{foo" - keep going.
			} else {
				// We've just seen the start of a parameter, so back up.
				context.back();
				break;
			}
		} else if (context.current === closeBrace) {
			if (!context.moveNext()) {
				// This is a dangling close-brace, which is not allowed
				context.error =
					"There is an incomplete parameter in the route template. Check that each '{' character has a matching '}' character." /* LOC */;
				return false;
			}

			if (context.current === closeBrace) {
				// This is an 'escaped' brace in a literal, like "{{foo" - keep going.
			} else {
				// This is an unbalanced close-brace, which is not allowed
				context.error =
					"There is an incomplete parameter in the route template. Check that each '{' character has a matching '}' character."; /* LOC */
				return false;
			}
		}

		if (!context.moveNext()) {
			break;
		}
	}

	const encoded = context.capture()!;
	const decoded = replaceAll(replaceAll(encoded, '}}', '}'), '{{', '{');
	if (isValidLiteral(context, decoded)) {
		parts.push(createLiteralPart(decoded));
		return true;
	} else {
		return false;
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,ec4f220dc199081d,references
function isValidParameterName(
	context: Context,
	parameterName: string,
): boolean {
	if (parameterName.length === 0 /* TODO: invalidParameterNameChars */) {
		context.error = `The route parameter name '${parameterName}' is invalid. Route parameter names must be non-empty and cannot contain these characters: '{{', '}}', '/'. The '?' character marks a parameter as optional, and can occur only at the end of the parameter. The '*' character mark ...` /* LOC */;
		return false;
	}

	// TODO: if (!context.parameterNames.add(parameterName)) {
	// TODO: 	context.error = `The route parameter name '${parameterName}' appears more than one time in the route template.`; /* LOC */
	// TODO: 	return false;
	// TODO: }

	return true;
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,f688b4bb14a38ca1,references
function parseParameter(context: Context, parts: RoutePatternPart[]): boolean {
	if (context.current !== openBrace) {
		throw new Error('Assertion failed.');
	}
	context.mark();

	context.moveNext();

	while (true) {
		if (context.current === openBrace) {
			// This is an open brace inside of a parameter, it has to be escaped
			if (context.moveNext()) {
				if (context.current != openBrace) {
					// If we see something like "{p1:regex(^\d{3", we will come here.
					context.error =
						"In a route parameter, '{' and '}' must be escaped with '{{' and '}}'." /* LOC */;
					return false;
				}
			} else {
				// This is a dangling open-brace, which is not allowed
				// Example: "{p1:regex(^\d{"
				context.error =
					"There is an incomplete parameter in the route template. Check that each '{' character has a matching '}' character." /* LOC */;
				return false;
			}
		} else if (context.current === closeBrace) {
			// When we encounter Closed brace here, it either means end of the parameter or it is a closed
			// brace in the parameter, in that case it needs to be escaped.
			// Example: {p1:regex(([}}])\w+}. First pair is escaped one and last marks end of the parameter
			if (!context.moveNext()) {
				// This is the end of the string -and we have a valid parameter
				break;
			}

			if (context.current == closeBrace) {
				// This is an 'escaped' brace in a parameter name
			} else {
				// This is the end of the parameter
				break;
			}
		}

		if (!context.moveNext()) {
			// This is a dangling open-brace, which is not allowed
			context.error =
				"There is an incomplete parameter in the route template. Check that each '{' character has a matching '}' character."; /* LOC */
			return false;
		}
	}

	const text = context.capture()!;
	if (text === '{}') {
		context.error = `The route parameter name '' is invalid. Route parameter names must be non-empty and cannot contain these characters: '{{', '}}', '/'. The '?' character marks a parameter as optional, and can occur only at the end of the parameter. The '*' character mark ...`; /* LOC */
		return false;
	}

	const inside = text?.substring(1, text.length - 1);
	const decoded = replaceAll(replaceAll(inside, '}}', '}'), '{{', '{');

	// At this point, we need to parse the raw name for inline constraint,
	// default values and optional parameters.
	const templatePart = parseRouteParameter(decoded);

	if (decoded.startsWith('*') && decoded.endsWith('?')) {
		context.error =
			'A catch-all parameter cannot be marked optional.' /* LOC */;
		return false;
	}

	// TODO

	const parameterName = templatePart.name;
	if (isValidParameterName(context, parameterName)) {
		parts.push(templatePart);
		return true;
	} else {
		return false;
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,3fca612f7c3e93f8,references
function isSegmentValid(context: Context, parts: RoutePatternPart[]): boolean {
	// If a segment has multiple parts, then it can't contain a catch all.
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (
			part instanceof RoutePatternParameterPart &&
			part.isCatchAll &&
			parts.length > 1
		) {
			context.error =
				'A path segment that contains more than one section, such as a literal section or a parameter, cannot contain a catch-all parameter.'; /* LOC */
			return false;
		}
	}

	// if a segment has multiple parts, then only the last one parameter can be optional
	// if it is following a optional separator.
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];

		if (
			part instanceof RoutePatternParameterPart &&
			part.isOptional &&
			parts.length > 1
		) {
			// This optional parameter is the last part in the segment
			if (i === parts.length - 1) {
				const previousPart = parts[i - 1];

				if (!previousPart.isLiteral && !previousPart.isSeparator) {
					// The optional parameter is preceded by something that is not a literal or separator
					// Example of error message:
					// "In the segment '{RouteValue}{param?}', the optional parameter 'param' is preceded
					// by an invalid segment '{RouteValue}'. Only a period (.) can precede an optional parameter.
					context.error = `In the segment '${RoutePatternPathSegment.debuggerToString(
						parts,
					)}', the optional parameter '${
						part.name
					}' is preceded by an invalid segment '${parts[
						i - 1
					].debuggerToString()}'. Only a period (.) can precede an optional parameter.` /* LOC */;

					return false;
				} else if (
					previousPart instanceof RoutePatternLiteralPart &&
					previousPart.content !== periodString
				) {
					// The optional parameter is preceded by a literal other than period.
					// Example of error message:
					// "In the segment '{RouteValue}-{param?}', the optional parameter 'param' is preceded
					// by an invalid segment '-'. Only a period (.) can precede an optional parameter.
					context.error = `In the segment '${RoutePatternPathSegment.debuggerToString(
						parts,
					)}', the optional parameter '${
						part.name
					}' is preceded by an invalid segment '${parts[
						i - 1
					].debuggerToString()}'. Only a period (.) can precede an optional parameter.` /* LOC */;

					return false;
				}

				parts[i - 1] = createSeparatorPart(
					(previousPart as RoutePatternLiteralPart).content,
				);
			} else {
				// This optional parameter is not the last one in the segment
				// Example:
				// An optional parameter must be at the end of the segment. In the segment '{RouteValue?})',
				// optional parameter 'RouteValue' is followed by ')'
				context.error = `An optional parameter must be at the end of the segment. In the segment '${RoutePatternPathSegment.debuggerToString(
					parts,
				)}', optional parameter '${part.name}' is followed by '${parts[
					i + 1
				].debuggerToString()}'.` /* LOC */;

				return false;
			}
		}
	}

	// A segment cannot contain two consecutive parameters
	let isLastSegmentParameter = false;
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (part.isParameter && isLastSegmentParameter) {
			context.error =
				"A path segment cannot contain two consecutive parameters. They must be separated by a '/' or by a literal string." /* LOC */;
			return false;
		}

		isLastSegmentParameter = part.isParameter;
	}

	return true;
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,9630914e4afafbe8,references
function parseSegment(
	context: Context,
	segments: List<RoutePatternPathSegment>,
): boolean {
	const parts: RoutePatternPart[] = [];

	while (true) {
		const i = context.index;

		if (context.current === openBrace) {
			if (!context.moveNext()) {
				// This is a dangling open-brace, which is not allowed
				context.error =
					"There is an incomplete parameter in the route template. Check that each '{' character has a matching '}' character."; /* LOC */
				return false;
			}

			if (context.current === openBrace) {
				// This is an 'escaped' brace in a literal, like "{{foo"
				context.back();
				if (!parseLiteral(context, parts)) {
					return false;
				}
			} else {
				// This is a parameter
				context.back();
				if (!parseParameter(context, parts)) {
					return false;
				}
			}
		} else {
			if (!parseLiteral(context, parts)) {
				return false;
			}
		}

		if (context.current === separator || context.atEnd()) {
			// We've reached the end of the segment
			break;
		}

		if (context.index <= i) {
			// This shouldn't happen, but we want to crash if it does.
			const message =
				'Infinite loop detected in the parser. Please open an issue.';
			throw new Error(message);
		}
	}

	if (isSegmentValid(context, parts)) {
		segments.add(new RoutePatternPathSegment(parts));
		return true;
	} else {
		return false;
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,58e93d53913c95fc,references
function isAllValid(
	context: Context,
	segments: List<RoutePatternPathSegment>,
): boolean {
	for (let i = 0; i < segments.count; i++) {
		const segment = segments.get(i);
		for (let j = 0; j < segment.parts.length; j++) {
			const part = segment.parts[j];
			if (
				part instanceof RoutePatternParameterPart &&
				part.isCatchAll &&
				(i !== segments.count - 1 || j !== segment.parts.length - 1)
			) {
				context.error =
					'A catch-all parameter can only appear as the last segment of the route template.'; /* LOC */
				return false;
			}
		}
	}

	return true;
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternParser.cs,f4f3d8affb948430,references
export function parseRoutePattern(pattern: string): RoutePattern {
	const trimmedPattern = trimPrefix(pattern);

	const context = new Context(trimmedPattern);
	const segments = new List<RoutePatternPathSegment>();

	while (context.moveNext()) {
		const i = context.index;

		if (context.current === separator) {
			// If we get here is means that there's a consecutive '/' character.
			// Templates don't start with a '/' and parsing a segment consumes the separator.
			throw new Error(
				"The route template separator character '/' cannot appear consecutively. It must be separated by either a parameter or a literal value." /* LOC */,
			);
		}

		if (!parseSegment(context, segments)) {
			throw new Error(context.error);
		}

		// A successful parse should always result in us being at the end or at a separator.
		if (!context.atEnd() && context.current !== separator) {
			throw new Error('Assertion failed.');
		}

		if (context.index <= i) {
			// This shouldn't happen, but we want to crash if it does.
			const message =
				'Infinite loop detected in the parser. Please open an issue.';
			throw new Error(message);
		}
	}

	if (isAllValid(context, segments)) {
		return createPattern(pattern, segments);
	} else {
		throw new Error(context.error);
	}
}
