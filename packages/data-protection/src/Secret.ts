import { IDisposable } from '@yohira/base';
import { randomBytes } from 'node:crypto';

import { ISecret } from './ISecret';

// REVIEW
// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Secret.cs,726e6ae00d63e382,references
export class Secret implements IDisposable, ISecret {
	private readonly localAllocHandle: Buffer;
	private readonly plaintextLength: number;

	private static protect(plaintext: Buffer): Buffer {
		// If we're not running on a platform that supports CryptProtectMemory,
		// shove the plaintext directly into a LocalAlloc handle. Ideally we'd
		// mark this memory page as non-pageable, but this is fraught with peril.
		if (true /* TODO */) {
			return Buffer.from(plaintext);
		}

		// TODO
		throw new Error('Method not implemented.');
	}

	constructor(value: Buffer) {
		if (value === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}

		this.localAllocHandle = Secret.protect(value);
		this.plaintextLength = value.length;
	}

	static random(numBytes: number): Secret {
		if (numBytes < 0) {
			throw new Error('Value must be non-negative.' /* LOC */);
		}

		if (numBytes === 0) {
			return new Secret(Buffer.alloc(0));
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

	private unprotectInto(buffer: Buffer): void {
		// If we're not running on a platform that supports CryptProtectMemory,
		// the handle contains plaintext bytes.
		if (true /* TODO */) {
			this.localAllocHandle.copy(buffer);
			return;
		}

		// TODO
		throw new Error('Method not implemented.');
	}

	writeSecretIntoBuffer(
		buffer: Buffer,
		bufferLength: number = buffer.length,
	): void {
		if (bufferLength !== this.length) {
			throw new Error(
				`The provided buffer is of length ${bufferLength} byte(s). It must instead be exactly ${this.length} byte(s) in length.` /* LOC */,
			);
		}

		if (this.length !== 0) {
			this.unprotectInto(buffer);
		}
	}
}
