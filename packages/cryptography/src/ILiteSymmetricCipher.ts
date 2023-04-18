import { IDisposable } from '@yohira/base';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/ILiteSymmetricCipher.cs,1b52e199b0ad218e,references
export interface ILiteSymmetricCipher extends IDisposable {
	readonly blockSizeInBytes: number;
	readonly paddingSizeInBytes: number;

	transformFinal(input: Buffer, output: Buffer): number;
	transform(input: Buffer, output: Buffer): number;
	reset(iv: Buffer): void;
}
