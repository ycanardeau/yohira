import { IAuthenticatedEncryptor } from './IAuthenticatedEncryptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/AuthenticatedEncryptorExtensions.cs,941760a7837040c4,references
export function encrypt(
	encryptor: IAuthenticatedEncryptor,
	plaintext: Buffer,
	additionalAuthenticatedData: Buffer,
	preBufferSize: number,
	postBufferSize: number,
): Buffer {
	// TODO

	// Fall back to the unoptimized version
	if (preBufferSize === 0 && postBufferSize === 0) {
		// optimization: call through to inner encryptor with no modifications
		return encryptor.encrypt(plaintext, additionalAuthenticatedData);
	} else {
		const temp = encryptor.encrypt(plaintext, additionalAuthenticatedData);
		const retVal = Buffer.alloc(
			preBufferSize + temp.length + postBufferSize,
		);
		temp.copy(retVal, preBufferSize, 0, temp.length);
		return retVal;
	}
}
