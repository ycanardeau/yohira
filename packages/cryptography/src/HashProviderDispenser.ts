import { CryptographicError } from './CryptographicError';
import {
	createHash as cryptoCreateHash,
	createHmac as cryptoCreateHmac,
} from 'node:crypto';

import { HashProvider } from './HashProvider';
import { LiteHash, LiteHmac, createHash, createHmac } from './LiteHashProvider';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HashProviderDispenser.OpenSsl.cs,79737ef98af8340d,references
class EvpHashProvider extends HashProvider {
	private readonly liteHash: LiteHash;
	private running = false;

	constructor(HashAlgorithmId: string) {
		super();

		this.liteHash = createHash(HashAlgorithmId);
	}

	get hashSizeInBytes(): number {
		return this.liteHash.hashSizeInBytes;
	}

	appendHashDataCore(data: Buffer): void {
		this.liteHash.append(data);
		this.running = true;
	}

	finalizeHashAndResetCore(destination: Buffer): number {
		const written = this.liteHash.finalize(destination);
		this.liteHash.reset();
		this.running = false;
		return written;
	}

	[Symbol.dispose](): void {
		this.liteHash[Symbol.dispose]();
	}

	reset(): void {
		if (this.running) {
			this.liteHash.reset();
			this.running = false;
		}
	}
}

export function createHashProvider(hashAlgorithmId: string): HashProvider {
	return new EvpHashProvider(hashAlgorithmId);
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HashProviderDispenser.OpenSsl.cs,09113b511888e58b,references
class HmacHashProvider extends HashProvider {
	private readonly liteHmac: LiteHmac;
	private running = false;

	constructor(hashAlgorithmId: string, key: Buffer) {
		super();

		this.liteHmac = createHmac(hashAlgorithmId, key);
	}

	get hashSizeInBytes(): number {
		return this.liteHmac.hashSizeInBytes;
	}

	appendHashDataCore(data: Buffer): void {
		this.liteHmac.append(data);
		this.running = true;
	}

	finalizeHashAndResetCore(destination: Buffer): number {
		const written = this.liteHmac.finalize(destination);
		this.liteHmac.reset();
		this.running = false;
		return written;
	}

	[Symbol.dispose](): void {
		this.liteHmac[Symbol.dispose]();
	}

	reset(): void {
		if (this.running) {
			this.liteHmac.reset();
			this.running = false;
		}
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HashProviderDispenser.OpenSsl.cs,e8eb137f11165a51,references
export function createMacProvider(
	hashAlgorithmId: string,
	key: Buffer,
): HashProvider {
	return new HmacHashProvider(hashAlgorithmId, key);
}

export class OneShotHashProvider {
	// REVIEW
	static macData(
		hashAlgorithmId: string,
		key: Buffer,
		source: Buffer,
		destination: Buffer,
	): number {
		const evpType = cryptoCreateHmac(hashAlgorithmId, key);

		const hashSize = cryptoCreateHmac(hashAlgorithmId, key).digest()
			.length; /* HACK */

		if (hashSize <= 0 || destination.length < hashSize) {
			throw new Error('Destination length or hash size not valid.');
		}

		evpType.update(source);
		const buffer = evpType.digest();
		buffer.copy(destination);
		const written = buffer.length;
		if (written !== hashSize) {
			throw new Error('Assertion failed.');
		}
		return written;
	}

	static hashData(
		hashAlgorithmId: string,
		source: Buffer,
		destination: Buffer,
	): number {
		const evpType = cryptoCreateHash(hashAlgorithmId);

		const hashSize =
			cryptoCreateHash(hashAlgorithmId).digest().length; /* HACK */

		if (hashSize <= 0 || destination.length < hashSize) {
			throw new CryptographicError();
		}

		const length = destination.length;
		evpType.update(source);
		const buffer = evpType.digest();
		buffer.copy(destination);

		if (length !== hashSize) {
			throw new Error('Assertion failed.');
		}

		return hashSize;
	}
}
