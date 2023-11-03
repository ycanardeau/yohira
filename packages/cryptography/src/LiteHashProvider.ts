import { IDisposable } from '@yohira/base';
import {
	Hash,
	Hmac,
	createHash as cryptoCreateHash,
	createHmac as cryptoCreateHmac,
} from 'node:crypto';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/LiteHashProvider.cs,212d0fbf5acf4379,references
interface ILiteHash extends IDisposable {
	readonly hashSizeInBytes: number;

	append(data: Buffer): void;
	finalize(destination: Buffer): number;
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/LiteHash.Unix.cs,49b8c8281a70958c,references
export class LiteHash implements ILiteHash {
	private readonly ctx: Hash;
	private readonly _hashSizeInBytes: number;

	constructor(private readonly algorithm: string) {
		this._hashSizeInBytes =
			cryptoCreateHash(algorithm).digest().length; /* HACK */

		this.ctx = cryptoCreateHash(algorithm);
	}

	get hashSizeInBytes(): number {
		return this._hashSizeInBytes;
	}

	append(data: Buffer): void {
		if (data.length === 0) {
			return;
		}

		// TODO
		//throw new Error('Method not implemented.');

		this.ctx.update(data);
	}

	finalize(destination: Buffer): number {
		if (destination.length < this._hashSizeInBytes) {
			throw new Error('Assertion failed.');
		}

		// TODO
		//throw new Error('Method not implemented.');

		const length = destination.length;
		const buffer = this.ctx.digest();
		buffer.copy(destination);
		if (length !== this._hashSizeInBytes) {
			throw new Error('Assertion failed.');
		}
		return this._hashSizeInBytes;
	}

	reset(): void {
		// TODO
		//throw new Error('Method not implemented.');

		(this.ctx as Hash) = cryptoCreateHash(this.algorithm);
	}

	[Symbol.dispose](): void {
		// TODO
		//throw new Error('Method not implemented.');
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/LiteHash.Unix.cs,2899ffc148668f4c,references
export function createHash(hashAlgorithmId: string): LiteHash {
	return new LiteHash(hashAlgorithmId);
}

// REVIEW
// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/LiteHash.Unix.cs,c3d06f2a23f96164,references
export class LiteHmac implements ILiteHash {
	private readonly ctx: Hmac;
	private readonly _hashSizeInBytes: number;

	constructor(
		private readonly algorithm: string,
		private readonly key: Buffer,
	) {
		this._hashSizeInBytes = cryptoCreateHmac(
			algorithm,
			key,
		).digest().length; /* HACK */

		this.ctx = cryptoCreateHmac(algorithm, key);
	}

	get hashSizeInBytes(): number {
		return this._hashSizeInBytes;
	}

	append(data: Buffer): void {
		if (data.length === 0) {
			return;
		}

		// TODO
		//throw new Error('Method not implemented.');

		this.ctx.update(data);
	}

	finalize(destination: Buffer): number {
		if (destination.length < this._hashSizeInBytes) {
			throw new Error('Assertion failed.');
		}

		// TODO
		//throw new Error('Method not implemented.');

		const length = destination.length;
		const buffer = this.ctx.digest();
		buffer.copy(destination);
		if (length !== this._hashSizeInBytes) {
			throw new Error('Assertion failed.');
		}
		return this._hashSizeInBytes;
	}

	reset(): void {
		// TODO
		//throw new Error('Method not implemented.');

		(this.ctx as Hmac) = cryptoCreateHmac(this.algorithm, this.key);
	}

	[Symbol.dispose](): void {
		// TODO
		//throw new Error('Method not implemented.');
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/LiteHash.Unix.cs,e36edd47e1e1d6b9,references
export function createHmac(hashAlgorithmId: string, key: Buffer): LiteHmac {
	return new LiteHmac(hashAlgorithmId, key);
}
