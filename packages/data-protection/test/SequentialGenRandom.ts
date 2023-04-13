import { IBCryptGenRandom, IManagedGenRandom } from '@yohira/data-protection';

export class SequentialGenRandom
	implements IBCryptGenRandom, IManagedGenRandom
{
	genRandom(numBytes: number): Buffer {
		// TODO
		throw new Error('Method not implemented.');
	}

	genRandomBCrypt(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
