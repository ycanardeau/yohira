import { IKey } from './IKey';
import { DefaultKeyResolution } from './internal/DefaultKeyResolution';
import { IDefaultKeyResolver } from './internal/IDefaultKeyResolver';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/DefaultKeyResolver.cs,53f63ccf038547e9,references
export class DefaultKeyResolver implements IDefaultKeyResolver {
	resolveDefaultKeyPolicy(
		now: number,
		allKeys: Iterable<IKey>,
	): DefaultKeyResolution {
		// TODO
		throw new Error('Method not implemented.');
	}
}
