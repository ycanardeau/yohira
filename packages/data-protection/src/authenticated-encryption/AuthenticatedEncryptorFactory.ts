import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';

import { IKey } from '../key-management/IKey';
import { IAuthenticatedEncryptor } from './IAuthenticatedEncryptor';
import { IAuthenticatedEncryptorFactory } from './IAuthenticatedEncryptorFactory';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/AuthenticatedEncryptorFactory.cs,ec529f4556c2b2ae,references
export class AuthenticatedEncryptorFactory
	implements IAuthenticatedEncryptorFactory
{
	constructor(private readonly loggerFactory: ILoggerFactory) {}

	createEncryptorInstance(key: IKey): IAuthenticatedEncryptor {
		// TODO
		throw new Error('Method not implemented.');
	}
}
