import { IKey } from '../key-management/IKey';
import { IAuthenticatedEncryptor } from './IAuthenticatedEncryptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/IAuthenticatedEncryptorFactory.cs,92337047d0959813,references
export interface IAuthenticatedEncryptorFactory {
	createEncryptorInstance(key: IKey): IAuthenticatedEncryptor | undefined;
}
