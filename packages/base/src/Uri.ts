import { isAsciiHexDigit } from './Char';

// https://source.dot.net/#System.Private.Uri/System/Uri.cs,ca738b9c908ef44a,references
export function isHexEncoding(pattern: string, index: number): boolean {
	return (
		pattern.length - index >= 3 &&
		pattern[index] === '%' &&
		isAsciiHexDigit(pattern[index + 1]) &&
		isAsciiHexDigit(pattern[index + 2])
	);
}
