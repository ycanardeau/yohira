import { IDisposable } from '@yohira/base';

import { IAuthenticatedEncryptor } from '../authenticated-encryption/IAuthenticatedEncryptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Managed/ManagedAuthenticatedEncryptor.cs,5ae5d9fd0d294a74,references
export class ManagedAuthenticatedEncryptor
	implements IAuthenticatedEncryptor, IDisposable
{
	decrypt(ciphertext: Buffer, additionalAuthenticatedData: Buffer): Buffer {
		// TODO
		throw new Error('Method not implemented.');
	}

	encrypt(plaintext: Buffer, additionalAuthenticatedData: Buffer): Buffer {
		// TODO
		throw new Error('Method not implemented.');
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
