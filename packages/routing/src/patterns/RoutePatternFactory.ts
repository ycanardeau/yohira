import { indexOfAny } from '@yohira/base';

import { RoutePattern } from './RoutePattern';
import { RoutePatternLiteralPart } from './RoutePatternLiteralPart';
import { RoutePatternParameterKind } from './RoutePatternParameterKind';
import { RoutePatternParameterPart } from './RoutePatternParameterPart';
import { invalidParameterNameChars } from './RoutePatternParser';
import { RoutePatternPart } from './RoutePatternPart';
import { RoutePatternPathSegment } from './RoutePatternPathSegment';
import { RoutePatternSeparatorPart } from './RoutePatternSeparatorPart';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,bf5cca5cd49d10f7,references
function createParameterPartCore(
	parameterName: string,
	// TODO: default,
	parameterKind: RoutePatternParameterKind,
	// TODO: parameterPolicies,
	encodeSlashes = true,
): RoutePatternParameterPart {
	return new RoutePatternParameterPart(
		parameterName,
		// TODO: default,
		parameterKind,
		// TODO: parameterPolicies,
		encodeSlashes,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,ed08b7f801ef8558,references
export function createParameterPart(
	parameterName: string,
	// TODO: default = undefined,
	parameterKind = RoutePatternParameterKind.Standard,
	// TODO: parameterPolicies = [],
): RoutePatternParameterPart {
	if (!parameterName) {
		throw new Error('Value cannot be undefined or empty.' /* LOC */);
	}

	if (indexOfAny(parameterName, invalidParameterNameChars) >= 0) {
		throw new Error(
			`The route parameter name '${parameterName}' is invalid. Route parameter names must be non-empty and cannot contain these characters: '{', '}', '/'. The '?' character marks a parameter as optional, and can occur only at the end of the parameter. The '*' character marks a parameter as catch-all, and can occur only at the start of the parameter.` /* LOC */,
		);
	}

	// TODO

	return createParameterPartCore(
		parameterName,
		// TODO: undefined,
		parameterKind,
		// TODO: parameterPolicies
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,c06282189a8561c9,references
function createPatternCore(
	rawText: string | undefined,
	// TODO: defaults,
	// TODO: parameterPolicies,
	// TODO: requiredValues,
	segments: Iterable<RoutePatternPathSegment>,
): RoutePattern {
	function visitPart(part: RoutePatternPart): RoutePatternPart {
		if (!part.isParameter) {
			return part;
		}

		const parameter = part as RoutePatternParameterPart;
		// TODO

		// TODO

		return createParameterPartCore(
			parameter.name,
			// TODO: default,
			parameter.parameterKind,
			// TODO: parameterConstraints,
			parameter.encodeSlashes,
		);
	}

	function visitSegment(
		segment: RoutePatternPathSegment,
	): RoutePatternPathSegment {
		let updatedParts: RoutePatternPart[] | undefined;
		for (let i = 0; i < segment.parts.length; i++) {
			const part = segment.parts[i];
			const updatedPart = visitPart(part);

			if (part !== updatedPart) {
				if (updatedParts === undefined) {
					updatedParts = Array.from(segment.parts);
				}

				updatedParts[i] = updatedPart;
			}
		}

		if (updatedParts === undefined) {
			return segment;
		}

		return new RoutePatternPathSegment(updatedParts);
	}

	// TODO

	let parameters: RoutePatternParameterPart[] | undefined;
	const updatedSegments = Array.from(segments);
	for (let i = 0; i < updatedSegments.length; i++) {
		const segment = visitSegment(updatedSegments[i]);
		updatedSegments[i] = segment;

		for (let j = 0; j < segment.parts.length; j++) {
			const part = segment.parts[j];
			if (part instanceof RoutePatternParameterPart) {
				if (parameters === undefined) {
					parameters = [];
				}

				parameters.push(part);
			}
		}
	}

	// TODO

	return new RoutePattern(
		rawText,
		// TODO
		// TODO
		// TODO
		parameters ?? [],
		updatedSegments,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,c1d67dd1d5e3c0ba,references
export function createPattern(
	rawText: string | undefined,
	segments: Iterable<RoutePatternPathSegment>,
): RoutePattern {
	return createPatternCore(
		rawText,
		// TODO: undefined,
		// TODO: undefined,
		// TODO: undefined,
		segments,
	);
}

function createLiteralPartCore(content: string): RoutePatternLiteralPart {
	return new RoutePatternLiteralPart(content);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,14daad750c7d2341,references
export function createLiteralPart(content: string): RoutePatternLiteralPart {
	if (!content) {
		throw new Error('Value cannot be undefined or empty.' /* LOC */);
	}

	if (content.includes('?')) {
		throw new Error(
			`The literal section '${content}' is invalid. Literal sections cannot contain the '?' character.` /* LOC */,
		);
	}

	return createLiteralPartCore(content);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,40ddc3d4a58c0df7,references
function createSegmentCore(parts: RoutePatternPart[]): RoutePatternPathSegment {
	return new RoutePatternPathSegment(parts);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,14daad750c7d2341
export function createSegment(
	...parts: RoutePatternPart[]
): RoutePatternPathSegment {
	return createSegmentCore(parts);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,11ac593723a6c405,references
function createSeparatorPartCore(content: string): RoutePatternSeparatorPart {
	return new RoutePatternSeparatorPart(content);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,d5df03281ce3db72,references
export function createSeparatorPart(
	content: string,
): RoutePatternSeparatorPart {
	if (!content) {
		throw new Error('Value cannot be undefined or empty.' /* LOC */);
	}

	return createSeparatorPartCore(content);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePatternFactory.cs,9b318498caad0054,references
export function combineRoutePattern(
	left: RoutePattern | undefined,
	right: RoutePattern,
): RoutePattern {
	if (left === undefined) {
		return right;
	}

	// TODO
	throw new Error('Method not implemented.');
}
