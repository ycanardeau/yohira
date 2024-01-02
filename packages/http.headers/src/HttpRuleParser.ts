import { Out, Ref, indexOfAnyExcept } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';

import { HttpParseResult } from './HttpParseResult';

// token = 1*<any CHAR except CTLs or separators>
// CTL = <any US-ASCII control character (octets 0 - 31) and DEL (127)>
const tokenChars =
	"!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~".split(
		'',
	);

const maxNestedCount = 5;

const cr = '\r';
const lf = '\n';
const sp = ' ';
const tab = '\t';

// https://source.dot.net/#Microsoft.Net.Http.Headers/src/Shared/HttpRuleParser.cs,867e8f421db604f4,references
export function getTokenLength(
	input: StringSegment,
	startIndex: number,
): number {
	// TODO: Contract.ensures

	if (startIndex >= input.length) {
		return 0;
	}

	const subspan = input.substring(startIndex);
	const firstNonTokenCharIdx = indexOfAnyExcept(subspan, tokenChars);
	return firstNonTokenCharIdx === -1 ? subspan.length : firstNonTokenCharIdx;
}

// https://source.dot.net/#Microsoft.Net.Http.Headers/src/Shared/HttpRuleParser.cs,e9bb67ba4933469c
export function getWhitespaceLength(
	input: StringSegment,
	startIndex: number,
): number {
	// TODO: Contract.ensures

	if (startIndex >= input.length) {
		return 0;
	}

	let current = startIndex;

	let c: string;
	while (current < input.length) {
		c = input.at(current);

		if (c === sp || c === tab) {
			current++;
			continue;
		}

		if (c === cr) {
			// If we have a #13 char, it must be followed by #10 and then at least one SP or HT.
			if (current + 2 < input.length && input.at(current + 1) === lf) {
				const spaceOrTab = input.at(current + 2);
				if (spaceOrTab === sp || spaceOrTab === tab) {
					current += 3;
					continue;
				}
			}
		}

		return current - startIndex;
	}

	// All characters between startIndex and the end of the string are LWS characters.
	return input.length - startIndex;
}

// quoted-pair = "\" CHAR
// CHAR = <any US-ASCII character (octets 0 - 127)>
function getQuotedPairLength(
	input: StringSegment,
	startIndex: number,
	length: Out<number>,
): HttpParseResult {
	if (startIndex < 0 || startIndex >= input.length) {
		throw new Error('Assertion failed.');
	}
	length.set(0);

	if (input.at(startIndex) !== '\\') {
		return HttpParseResult.NotParsed;
	}

	// Quoted-char has 2 characters. Check whether there are 2 chars left ('\' + char)
	// If so, check whether the character is in the range 0-127. If not, it's an invalid value.
	if (
		startIndex + 2 > input.length ||
		input.at(startIndex + 1).charCodeAt(0) > 127
	) {
		return HttpParseResult.InvalidFormat;
	}

	// We don't care what the char next to '\' is.
	length.set(2);
	return HttpParseResult.Parsed;
}

// https://source.dot.net/#Microsoft.Net.Http.Headers/src/Shared/HttpRuleParser.cs,155115958e640c6e,references
function getExpressionLength(
	input: StringSegment,
	startIndex: number,
	openChar: string,
	closeChar: string,
	supportsNesting: boolean,
	nestedCount: Ref<number>,
	length: Out<number>,
): HttpParseResult {
	if (input === undefined) {
		throw new Error('Assertion failed.');
	}
	if (startIndex < 0 || startIndex >= input.length) {
		throw new Error('Assertion failed.');
	}

	length.set(0);

	if (input.at(startIndex) !== openChar) {
		return HttpParseResult.NotParsed;
	}

	let current = startIndex + 1; // Start parsing with the character next to the first open-char
	while (current < input.length) {
		// Only check whether we have a quoted char, if we have at least 3 characters left to read (i.e.
		// quoted char + closing char). Otherwise the closing char may be considered part of the quoted char.
		let quotedPairLength = 0;
		if (
			current + 2 < input.length &&
			getQuotedPairLength(input, current, {
				set: (value) => (quotedPairLength = value),
			}) === HttpParseResult.Parsed
		) {
			// We ignore invalid quoted-pairs. Invalid quoted-pairs may mean that it looked like a quoted pair,
			// but we actually have a quoted-string: e.g. "\ü" ('\' followed by a char >127 - quoted-pair only
			// allows ASCII chars after '\'; qdtext allows both '\' and >127 chars).
			current = current + quotedPairLength;
			continue;
		}

		// If we support nested expressions and we find an open-char, then parse the nested expressions.
		if (supportsNesting && input.at(current) === openChar) {
			nestedCount.set(nestedCount.get() + 1);
			try {
				// Check if we exceeded the number of nested calls.
				if (nestedCount.get() > maxNestedCount) {
					return HttpParseResult.InvalidFormat;
				}

				let nestedLength = 0;
				const nestedResult = getExpressionLength(
					input,
					current,
					openChar,
					closeChar,
					supportsNesting,
					nestedCount,
					{
						set: (value) => (nestedLength = value),
					},
				);

				switch (nestedResult) {
					case HttpParseResult.Parsed:
						current += nestedLength; // add the length of the nested expression and continue.
						break;

					case HttpParseResult.NotParsed:
						// TODO: assert
						break;

					case HttpParseResult.InvalidFormat:
						// If the nested expression is invalid, we can't continue, so we fail with invalid format.
						return HttpParseResult.InvalidFormat;

					default:
						// TODO: assert
						break;
				}
			} finally {
				nestedCount.set(nestedCount.get() - 1);
			}
		}

		if (input.at(current) === closeChar) {
			length.set(current - startIndex + 1);
			return HttpParseResult.Parsed;
		}
		current++;
	}

	// We didn't see the final quote, therefore we have an invalid expression string.
	return HttpParseResult.InvalidFormat;
}

// https://source.dot.net/#Microsoft.Net.Http.Headers/src/Shared/HttpRuleParser.cs,e7d7afafdef3cd9c,references
export function getQuotedStringLength(
	input: StringSegment,
	startIndex: number,
	length: Out<number>,
): HttpParseResult {
	let nestedCount = 0;
	return getExpressionLength(
		input,
		startIndex,
		'"',
		'"',
		false,
		{
			get: () => nestedCount,
			set: (value) => (nestedCount = value),
		},
		length,
	);
}
