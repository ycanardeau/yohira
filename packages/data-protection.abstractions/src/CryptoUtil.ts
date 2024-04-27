import { CryptographicError } from '@yohira/cryptography';

function failCore(message: string): Error {
	throw new CryptographicError(`Assertion failed: ${message}`);
}

// Allows callers to write "var x = Method() ?? Fail<T>(message);" as a convenience to guard
// against a method returning null unexpectedly.
export function fail<T>(message: string): T {
	throw failCore(message);
}
