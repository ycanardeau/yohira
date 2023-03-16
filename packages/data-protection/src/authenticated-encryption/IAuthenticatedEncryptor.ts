// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/IAuthenticatedEncryptor.cs,1be3bad9a3a5d0a3,references
export interface IAuthenticatedEncryptor {
	decrypt(ciphertext: Buffer, additionalAuthenticatedData: Buffer): Buffer;
	encrypt(plaintext: Buffer, additionalAuthenticatedData: Buffer): Buffer;
}
