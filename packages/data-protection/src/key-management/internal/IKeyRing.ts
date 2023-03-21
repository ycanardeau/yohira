import { Guid, Out } from '@yohira/base';

import { IAuthenticatedEncryptor } from '../../authenticated-encryption/IAuthenticatedEncryptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/Internal/IKeyRing.cs,f5dd14c965223104,references
export interface IKeyRing {
	readonly defaultAuthenticatedEncryptor: IAuthenticatedEncryptor | undefined;
	readonly defaultKeyId: Guid;
	getAuthenticatedEncryptorByKeyId(
		keyId: Guid,
		isRevoked: Out<boolean>,
	): IAuthenticatedEncryptor | undefined;
}
