// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/KeySizes.cs,8d2fb6273abd6cfa,references
// This structure is used for returning the set of legal key sizes and
// block sizes of the symmetric algorithms.
export class KeySizes {
	constructor(
		readonly minSize: number,
		readonly maxSize: number,
		readonly skipSize: number,
	) {}

	clone(): KeySizes {
		return new KeySizes(this.minSize, this.maxSize, this.skipSize);
	}
}
