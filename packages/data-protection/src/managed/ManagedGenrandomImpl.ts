import { randomBytes } from 'node:crypto';

import { IManagedGenRandom } from './IManagedGenRandom';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Managed/ManagedGenRandomImpl.cs,954b14f73ab56dd6,references
export class ManagedGenrandomImpl implements IManagedGenRandom {
	static readonly instance = new ManagedGenrandomImpl();

	genRandom(numBytes: number): Buffer {
		return randomBytes(numBytes);
	}
}
