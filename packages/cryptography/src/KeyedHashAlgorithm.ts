import { HashAlgorithm } from './HashAlgorithm';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/KeyedHashAlgorithm.cs,c68ffe2089d6c464,references
export abstract class KeyedHashAlgorithm extends HashAlgorithm {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	protected keyValue: Buffer = undefined!;

	get key(): Buffer {
		return Buffer.from(this.keyValue);
	}
	set key(value: Buffer) {
		this.keyValue = Buffer.from(value);
	}

	[Symbol.dispose](): void {
		// For keyed hash algorithms, we always want to zero out the key value
		if (this.keyValue !== undefined) {
			this.keyValue.fill(0);
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.keyValue = undefined!;
		super[Symbol.dispose]();
	}
}
