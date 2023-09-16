// https://source.dot.net/#System.Private.Uri/System/UriExt.cs,9e681434ccd4ea05,references
export function unescapeDataString(stringToUnescape: string): string {
	return decodeURIComponent(stringToUnescape);
}

// https://source.dot.net/#System.Private.Uri/System/UriExt.cs,39926dc8cc434ff4,references
export function escapeDataString(stringToEscape: string): string {
	return encodeURIComponent(stringToEscape);
}
