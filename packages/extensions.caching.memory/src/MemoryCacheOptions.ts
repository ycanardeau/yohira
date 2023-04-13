import { Ctor } from '@yohira/base';
import { IOptions } from '@yohira/extensions.options';

// https://source.dot.net/#Microsoft.Extensions.Caching.Memory/MemoryCacheOptions.cs,71db5b46a4b22065,references
export class MemoryCacheOptions implements IOptions<MemoryCacheOptions> {
	expirationScanFrequency = 1 * 60 * 1000;
	trackLinkedCacheEntries = false;
	trackStatistics = false;

	getValue(optionsCtor: Ctor<MemoryCacheOptions>): MemoryCacheOptions {
		return this;
	}
}
