import { IDataProtectionProvider } from './IDataProtectionProvider';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection.Abstractions/IDataProtector.cs,12abd1880b16009c,references
/**
 * An interface that can provide data protection services.
 */
export interface IDataProtector extends IDataProtectionProvider {
	/**
	 * Cryptographically protects a piece of plaintext data.
	 * @param plaintext The plaintext data to protect.
	 * @returns The protected form of the plaintext data.
	 */
	protect(plaintext: Buffer): Buffer;
	/**
	 * Cryptographically unprotects a piece of protected data.
	 * @param protectedData The protected data to unprotect.
	 * @returns The plaintext form of the protected data.
	 */
	unprotect(protectedData: Buffer): Buffer;
}
