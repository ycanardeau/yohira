import { IKey } from './IKey';

export const IKeyManager = Symbol.for('IKeyManager');
// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/IKeyManager.cs,80849cf24ea2c81a,references
export interface IKeyManager {
	createNewKey(activationDate: number, expirationDate: number): IKey;
	getAllKeys(): readonly IKey[];
	getCacheExpirationToken(): void /* TODO: CancellationToken */;
}
