import { IReadonlyCollection } from '@yohira/base';

import { IKey } from './IKey';

export const IKeyManager = Symbol.for('IKeyManager');
// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/IKeyManager.cs,80849cf24ea2c81a,references
export interface IKeyManager {
	getAllKeys(): IReadonlyCollection<IKey>;
	getCacheExpirationToken(): void /* TODO: CancellationToken */;
}
