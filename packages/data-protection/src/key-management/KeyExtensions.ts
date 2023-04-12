import { IKey } from './IKey';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyExtensions.cs,8514e6b5d24cde39,references
export function isExpired(key: IKey, now: number): boolean {
	return key.expirationDate <= now;
}
