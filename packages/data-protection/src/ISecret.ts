import { IDisposable } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/ISecret.cs,2e17eebed5eb8518,references
/**
 * Represents a secret value.
 */
export interface ISecret extends IDisposable {
	/**
	 * The length (in bytes) of the secret value.
	 */
	readonly length: number;
}
