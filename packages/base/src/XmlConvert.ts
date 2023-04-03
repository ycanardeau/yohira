import { isNCNameSingleChar, isStartNCNameSingleChar } from './XmlCharType';

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlConvert.cs,0f6e54e8fc921e59,references
export enum ErrorType {
	ArgumentError,
	XmlError,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/ValidateNames.cs,0ff5857a84b16b8c,references
function parseNCName(s: string, offset: number): number {
	if (s === undefined || offset > s.length) {
		throw new Error('Assertion failed.');
	}

	// Quit if the first character is not a valid NCName starting character
	let i = offset;
	if (i < s.length) {
		if (isStartNCNameSingleChar(s.charCodeAt(i))) {
			i++;
		} else {
			return 0;
		}

		// Keep parsing until the end of string or an invalid NCName character is reached
		while (i < s.length) {
			if (isNCNameSingleChar(s.charCodeAt(i))) {
				i++;
			} else {
				break;
			}
		}
	}

	return i - offset;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlConvert.cs,dcd47dcb67424054,references
export function verifyNCName(
	name: string,
	errorType = ErrorType.XmlError,
): string {
	if (name.length === 0) {
		throw new Error(
			"The empty string '' is not a valid local name." /* LOC */,
		);
	}

	const end = parseNCName(name, 0);

	if (end !== name.length) {
		// If the string is not a valid NCName, then throw or return false
		throw new Error(/* TODO: message */);
	}

	return name;
}
