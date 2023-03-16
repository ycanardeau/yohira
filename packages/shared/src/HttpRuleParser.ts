import { StringSegment } from '@yohira/extensions.primitives';

// token = 1*<any CHAR except CTLs or separators>
// CTL = <any US-ASCII control character (octets 0 - 31) and DEL (127)>
const tokenChars =
	"!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~".split(
		'',
	);

const CR = '\r';
const LF = '\n';
const SP = ' ';
const Tab = '\t';

// OPTIMIZE
export function indexOfAnyExcept(
	searchSpace: string,
	values: string[],
): number {
	for (let i = 0; i < searchSpace.length; i++) {
		if (values.every((value) => value !== searchSpace[i])) {
			return i;
		}
	}
	return -1;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/src/Shared/HttpRuleParser.cs,867e8f421db604f4,references
export function getTokenLength(
	input: StringSegment,
	startIndex: number,
): number {
	// TODO: Contract.ensures

	if (startIndex >= input.length) {
		return 0;
	}

	const subspan = input.subsegment(startIndex).substring(0);
	const firstNonTokenCharIdx = indexOfAnyExcept(subspan, tokenChars);
	return firstNonTokenCharIdx === -1 ? subspan.length : firstNonTokenCharIdx;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/src/Shared/HttpRuleParser.cs,e9bb67ba4933469c,references
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

		if (c === SP || c === Tab) {
			current++;
			continue;
		}

		if (c === CR) {
			// If we have a #13 char, it must be followed by #10 and then at least one SP or HT.
			if (current + 2 < input.length && input.at(current + 1) === LF) {
				const spaceOrTab = input.at(current + 2);
				if (spaceOrTab === SP || spaceOrTab === Tab) {
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
