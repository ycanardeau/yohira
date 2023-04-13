import { IDisposable } from '@yohira/base';
import { Result } from '@yohira/third-party.ts-results';

// https://source.dot.net/#Microsoft.Extensions.Caching.Abstractions/IMemoryCache.cs,f4e3e6f9f935dbd5,references
export interface IMemoryCache extends IDisposable {
	tryGetValue(
		key: string /* TODO: object */,
	): Result<object | undefined, undefined>;
}
