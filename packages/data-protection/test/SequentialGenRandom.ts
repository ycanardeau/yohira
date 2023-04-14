import { IBCryptGenRandom, IManagedGenRandom } from '@yohira/data-protection';

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/SequentialGenRandom.cs#L9
export class SequentialGenRandom
	implements IBCryptGenRandom, IManagedGenRandom
{
	private value = 0;

	genRandom(numBytes: number): Buffer {
		const bytes = Buffer.alloc(numBytes);
		for (let i = 0; i < bytes.length; i++) {
			bytes[i] = this.value++;
		}
		return bytes;
	}

	genRandomBCrypt(buffer: Buffer): void {
		for (let i = 0; i < buffer.length; i++) {
			buffer[i] = this.value++;
		}
	}
}
