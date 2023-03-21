import { Guid } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/IKey.cs,a0dff5753be55cd1,references
export interface IKey {
	readonly keyId: Guid;
}
