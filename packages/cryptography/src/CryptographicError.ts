// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Security/CryptographicException.cs,0b7aa8a209a7f19f,references
export class CryptographicError extends Error {
	constructor(
		message?: string,
		readonly inner?: Error,
	) {
		super(message);
	}
}
