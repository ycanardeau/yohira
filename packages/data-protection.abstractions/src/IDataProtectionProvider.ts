import { IDataProtector } from './IDataProtector';

export const IDataProtectionProvider = Symbol.for('IDataProtectionProvider');
// https://source.dot.net/#Microsoft.AspNetCore.DataProtection.Abstractions/IDataProtectionProvider.cs,6055e31e2b49ab54,references
export interface IDataProtectionProvider {
	createProtector(purpose: string): IDataProtector;
}
