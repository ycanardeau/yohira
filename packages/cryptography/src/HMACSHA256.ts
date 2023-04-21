import { OneShotHashProvider } from '@yohira/cryptography';
import { Err, Ok, Result } from '@yohira/third-party.ts-results';
import { randomBytes } from 'node:crypto';

import { HMAC } from './HMAC';
import { HMACCommon } from './HMACCommon';
import { HashAlgorithmNames } from './HashAlgorithmNames';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HMACSHA256.cs,fbe807e4ab1f7871,references
export class HMACSHA256 extends HMAC {
	/**
	 * The hash size produced by the HMAC SHA256 algorithm, in bits.
	 */
	static readonly hashSizeInBits = 256;

	/**
	 * The hash size produced by the HMAC SHA256 algorithm, in bytes.
	 */
	static readonly hashSizeInBytes = HMACSHA256.hashSizeInBits / 8;

	private hMacCommon: HMACCommon;
	private static readonly blockSize = 64;

	constructor(key: Buffer = randomBytes(HMACSHA256.blockSize)) {
		super();

		// TODO
		this.hMacCommon = new HMACCommon(
			HashAlgorithmNames.SHA256,
			key,
			HMACSHA256.blockSize,
		);
		// TODO
		this.hashSizeValue = this.hMacCommon.hashSizeInBits;
		if (this.hashSizeValue !== HMACSHA256.hashSizeInBits) {
			throw new Error('Assertion failed.');
		}
	}

	get key(): Buffer {
		return super.key;
	}
	set key(value: Buffer) {
		if (value === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}
		this.hMacCommon.changeKey(value);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		super.key = this.hMacCommon.actualKey!;
	}

	static tryHashData(
		key: Buffer,
		source: Buffer,
		destination: Buffer,
	): Result<number, number> {
		if (destination.length < HMACSHA256.hashSizeInBytes) {
			return new Err(0);
		}

		const bytesWritten = OneShotHashProvider.macData(
			HashAlgorithmNames.SHA256,
			key,
			source,
			destination,
		);
		if (bytesWritten !== HMACSHA256.hashSizeInBytes) {
			throw new Error('Assertion failed.');
		}

		return new Ok(bytesWritten);
	}

	static hashData(key: Buffer, source: Buffer, destination: Buffer): number;
	static hashData(key: Buffer, source: Buffer): Buffer;
	static hashData(
		key: Buffer,
		source: Buffer,
		destination?: Buffer,
	): number | Buffer {
		if (destination !== undefined) {
			const tryHashDataResult = HMACSHA256.tryHashData(
				key,
				source,
				destination,
			);
			if (!tryHashDataResult.ok) {
				throw new Error('Destination is too short.');
			}

			return tryHashDataResult.val;
		} else {
			if (key === undefined) {
				throw new Error('Value cannot be undefined.');
			}
			if (source === undefined) {
				throw new Error('Value cannot be undefined.');
			}

			const buffer = Buffer.alloc(this.hashSizeInBytes);

			const written = HMACSHA256.hashData(key, source, buffer);
			if (written !== buffer.length) {
				throw new Error('Assertion failed.');
			}

			return buffer;
		}
	}

	protected hashCore(rgb: Buffer, ib: number, cb: number): void {
		return this.hMacCommon.appendHashData(rgb, ib, cb);
	}

	protected hashFinal(): Buffer {
		return this.hMacCommon.finalizeHashAndReset();
	}

	initialize(): void {
		return this.hMacCommon.reset();
	}

	dispose(): void {
		const hMacCommon = this.hMacCommon;
		if (hMacCommon !== undefined) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.hMacCommon = undefined!;
			hMacCommon.dispose();
		}
		super.dispose();
	}
}
