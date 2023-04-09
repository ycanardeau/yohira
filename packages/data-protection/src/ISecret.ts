import { IDisposable } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/ISecret.cs,2e17eebed5eb8518,references
export interface ISecret extends IDisposable {
	readonly length: number;
}
