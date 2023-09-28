export class CryptographicError extends Error {
	constructor(
		message?: string,
		readonly inner?: Error,
	) {
		super(message);
	}
}
