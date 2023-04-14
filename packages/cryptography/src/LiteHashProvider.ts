import { IDisposable } from '@yohira/base';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/LiteHashProvider.cs,212d0fbf5acf4379,references
interface ILiteHash extends IDisposable {
	readonly hashSizeInBytes: number;

	append(data: Buffer): void;
	finalize(destination: Buffer): number;
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/LiteHash.Unix.cs,c3d06f2a23f96164,references
export class LiteHmac implements ILiteHash {
	constructor(/* TODO: algorithm, */ key: Buffer) {}

	get hashSizeInBytes(): number {
		// TODO
		throw new Error('Method not implemented.');
	}

	append(data: Buffer): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	finalize(destination: Buffer): number {
		// TODO
		throw new Error('Method not implemented.');
	}

	reset(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/LiteHash.Unix.cs,e36edd47e1e1d6b9,references
export function createHmac(hashAlgorithmId: string, key: Buffer): LiteHmac {
	return new LiteHmac(/* TODO: algorithm, */ key);
}
