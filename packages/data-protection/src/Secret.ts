import { IDisposable } from '@yohira/base';

import { ISecret } from './ISecret';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Secret.cs,726e6ae00d63e382,references
export class Secret implements IDisposable, ISecret {
	private readonly plaintextLength: number;

	constructor(value: Buffer) {
		this.plaintextLength = value.length;
	}

	get length(): number {
		return this.plaintextLength;
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
