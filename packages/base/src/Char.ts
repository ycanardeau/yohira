// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Char.cs,19267de4017b0e3d,references
export function isAsciiHexDigit(value: string): boolean {
	return /^[0-9A-Fa-f]+$/.test(value);
}
