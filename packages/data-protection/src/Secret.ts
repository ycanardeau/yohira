import { IDisposable } from '@yohira/base';
import { randomBytes } from 'node:crypto';

import { ISecret } from './ISecret';

// REVIEW
// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Secret.cs,726e6ae00d63e382,references
export class Secret implements IDisposable, ISecret {
	private readonly plaintextLength: number;

	constructor(value: Buffer) {
		this.plaintextLength = value.length;
	}

	static random(numBytes: number): Secret {
		if (numBytes < 0) {
			throw new Error('Value must be non-negative.' /* LOC */);
		}

		if (numBytes === 0) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			// REVIEW
			return new Secret(randomBytes(numBytes));
		}
	}

	get length(): number {
		return this.plaintextLength;
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
