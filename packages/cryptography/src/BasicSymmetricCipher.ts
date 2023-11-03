import { IDisposable } from '@yohira/base';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/BasicSymmetricCipher.cs,f47c054bd8e81a20,references
export abstract class BasicSymmetricCipher implements IDisposable {
	protected _iv: Buffer | undefined;
	protected get iv(): Buffer | undefined {
		return this._iv;
	}
	private set iv(value: Buffer | undefined) {
		this._iv = value;
	}

	private _blockSizeInBytes: number;
	get blockSizeInBytes(): number {
		return this._blockSizeInBytes;
	}
	private set blockSizeInBytes(value: number) {
		this._blockSizeInBytes = value;
	}

	private _paddingSizeInBytes: number;
	get paddingSizeInBytes(): number {
		return this._paddingSizeInBytes;
	}
	private set paddingSizeInBytes(value: number) {
		this._paddingSizeInBytes = value;
	}

	protected constructor(
		iv: Buffer | undefined,
		blockSizeInBytes: number,
		paddingSizeInBytes: number,
	) {
		this._iv = iv;
		this._blockSizeInBytes = blockSizeInBytes;
		this._paddingSizeInBytes = paddingSizeInBytes;
	}

	abstract transform(input: Buffer, output: Buffer): number;

	abstract transformFinal(input: Buffer, output: Buffer): number;

	[Symbol.dispose](): void {
		if (this.iv !== undefined) {
			this.iv.fill(0);
			this.iv = undefined;
		}
	}
}
