import { randomBytes } from 'node:crypto';

import { HMAC } from './HMAC';
import { HMACCommon } from './HMACCommon';
import { HashAlgorithmNames } from './HashAlgorithmNames';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HMACSHA512.cs,041349299f588cc0,references
export class HMACSHA512 extends HMAC {
	private hMacCommon: HMACCommon;
	private static readonly blockSize = 128;

	constructor(key: Buffer = randomBytes(HMACSHA512.blockSize)) {
		super();

		// TODO
		this.hMacCommon = new HMACCommon(
			HashAlgorithmNames.SHA512,
			key,
			HMACSHA512.blockSize,
		);
		// TODO
		this.hashSizeValue = this.hMacCommon.hashSizeInBits;
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
