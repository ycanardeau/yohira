import { ISecret } from '../../ISecret';
import { IAuthenticatedEncryptorDescriptor } from '../IAuthenticatedEncryptorDescriptor';
import { AuthenticatedEncryptorConfig } from './AuthenticatedEncryptorConfig';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ConfigurationModel/AuthenticatedEncryptorDescriptor.cs,6d392486f4636800,references
export class AuthenticatedEncryptorDescriptor
	implements IAuthenticatedEncryptorDescriptor
{
	constructor(
		readonly config: AuthenticatedEncryptorConfig,
		readonly masterKey: ISecret,
	) {}
}
