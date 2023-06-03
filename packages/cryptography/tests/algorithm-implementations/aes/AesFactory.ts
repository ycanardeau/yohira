import { Aes } from '@yohira/cryptography';

interface IAesProvider {
	create(): Aes;
}

class AesProvider implements IAesProvider {
	create(): Aes {
		return Aes.create();
	}
}

export class AesFactory {
	private static readonly provider: IAesProvider = new AesProvider();

	static create(): Aes {
		return AesFactory.provider.create();
	}
}
