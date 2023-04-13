import { IDistributedCache } from '@yohira/extensions.caching.abstractions';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';

import { MemoryCache } from './MemoryCache';
import { MemoryDistributedCacheOptions } from './MemoryDistributedCacheOptions';

// https://source.dot.net/#Microsoft.Extensions.Caching.Memory/MemoryDistributedCache.cs,e95435b5f898f6fe,references
export class MemoryDistributedCache implements IDistributedCache {
	private readonly memCache: MemoryCache;

	constructor(
		@inject(Symbol.for('IOptions<MemoryDistributedCacheOptions>'))
		optionsAccessor: IOptions<MemoryDistributedCacheOptions>,
		@inject(ILoggerFactory)
		loggerFactory: ILoggerFactory,
	) {
		this.memCache = new MemoryCache(
			optionsAccessor.getValue(MemoryDistributedCacheOptions),
			loggerFactory,
		);
	}

	refreshSync(key: string): void {
		this.memCache.tryGetValue(key);
	}

	refresh(key: string /* TODO: , token: CancellationToken */): Promise<void> {
		this.refreshSync(key);
		return Promise.resolve();
	}
}
