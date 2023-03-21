import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';

import { IAuthenticatedEncryptorFactory } from './IAuthenticatedEncryptorFactory';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/AuthenticatedEncryptorFactory.cs,ec529f4556c2b2ae,references
export class AuthenticatedEncryptorFactory
	implements IAuthenticatedEncryptorFactory
{
	constructor(private readonly loggerFactory: ILoggerFactory) {}
}
