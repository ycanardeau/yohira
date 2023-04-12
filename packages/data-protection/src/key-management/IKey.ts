import { Guid } from '@yohira/base';

import { IAuthenticatedEncryptor } from '../authenticated-encryption/IAuthenticatedEncryptor';
import { IAuthenticatedEncryptorDescriptor } from '../authenticated-encryption/conifg-model/IAuthenticatedEncryptorDescriptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/IKey.cs,a0dff5753be55cd1,references
export interface IKey {
	readonly activationDate: number;
	readonly creationDate: number;
	readonly expirationDate: number;
	readonly isRevoked: boolean;
	readonly keyId: Guid;
	readonly descriptor: IAuthenticatedEncryptorDescriptor;
	createEncryptor(): IAuthenticatedEncryptor | undefined;
}
