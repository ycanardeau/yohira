// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/Ascii.cs,b521bbd4d91468bc,references
export function asciiIgnoreCaseEquals(
	a: string,
	b: string,
	length: number,
): boolean {
	return a.toLowerCase() === b.toLowerCase(); /* OPTIMIZE */
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/Ascii.cs,85249ba4a958fca2,references
export function isAscii(text: string): boolean {
	for (let i = 0; i < text.length; i++) {
		if (text.charCodeAt(i) > 0x7f) {
			return false;
		}
	}

	return true;
}
