import { randomBytes } from 'node:crypto';

import { HMAC } from './HMAC';
import { HMACCommon } from './HMACCommon';
import { HashAlgorithmNames } from './HashAlgorithmNames';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HMACSHA256.cs,fbe807e4ab1f7871,references
export class HMACSHA256 extends HMAC {
	static readonly hashSizeInBits = 256;

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
