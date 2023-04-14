import { HashProvider } from './HashProvider';
import { LiteHmac, createHmac } from './LiteHashProvider';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HashProviderDispenser.OpenSsl.cs,09113b511888e58b,references
class HmacHashProvider extends HashProvider {
	private readonly liteHmac: LiteHmac;
	private running = false;

	constructor(hashAlgorithmId: string, key: Buffer) {
		super();

		this.liteHmac = createHmac(hashAlgorithmId, key);
	}

	get hashSizeInBytes(): number {
		return this.liteHmac.hashSizeInBytes;
	}

	appendHashDataCore(data: Buffer): void {
		this.liteHmac.append(data);
		this.running = true;
	}

	finalizeHashAndResetCore(destination: Buffer): number {
		const written = this.liteHmac.finalize(destination);
		this.liteHmac.reset();
		this.running = false;
		return written;
	}

	dispose(): void {
		this.liteHmac.dispose();
	}

	reset(): void {
		if (this.running) {
			this.liteHmac.reset();
			this.running = false;
		}
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HashProviderDispenser.OpenSsl.cs,e8eb137f11165a51,references
export function createMacProvider(
	hashAlgorithmId: string,
	key: Buffer,
): HashProvider {
	return new HmacHashProvider(hashAlgorithmId, key);
}
