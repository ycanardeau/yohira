import { IKey } from '../IKey';
import { DefaultKeyResolution } from './DefaultKeyResolution';

export const IDefaultKeyResolver = Symbol.for('IDefaultKeyResolver');
// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/Internal/IDefaultKeyResolver.cs,5aa7e58aa4eef25d,references
export interface IDefaultKeyResolver {
	resolveDefaultKeyPolicy(
		now: number,
		allKeys: Iterable<IKey>,
	): DefaultKeyResolution;
}
