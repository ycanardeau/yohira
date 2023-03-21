import { IDisposable } from '@yohira/base';

import { ISecret } from './ISecret';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Secret.cs,726e6ae00d63e382,references
export class Secret implements IDisposable, ISecret {
	private readonly plaintextLength: number;

	constructor(secret: Buffer, secretLength: number) {
		if (secret === undefined) {
			throw new Error('Value cannot be null.' /* LOC */);
		}
		if (secretLength < 0) {
			throw new Error('Value must be non-negative.' /* LOC */);
		}

		// TODO
		this.plaintextLength = secretLength;
	}

	/**
	 * Returns a Secret made entirely of random bytes retrieved from
	 * a cryptographically secure RNG.
	 */
	static random(numBytes: number): Secret {
		if (numBytes < 0) {
			throw new Error('Value must be non-negative.' /* LOC */);
		}

		if (numBytes === 0) {
			const dummy = Buffer.alloc(0);
			return new Secret(dummy, 0);
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	get length(): number {
		// TODO
		throw new Error('Method not implemented.');
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
