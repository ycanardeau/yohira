import { List, tryGetValue } from '@yohira/base';
import {
	EvictionReason,
	IMemoryCache,
} from '@yohira/extensions.caching.abstractions';
import {
	ILogger,
	ILoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';
import { Err, Ok, Result } from '@yohira/third-party.ts-results';

import { CacheEntry } from './CacheEntry';
import { MemoryCacheOptions } from './MemoryCacheOptions';

// https://source.dot.net/#Microsoft.Extensions.Caching.Memory/MemoryCache.cs,9c1ce8ad1b35fe8e,references
class Stats {}

// https://source.dot.net/#Microsoft.Extensions.Caching.Memory/MemoryCache.cs,30fa3864cc19f0a3,references
class CoherentState {
	/** @internal */ entries: Map<
		string,
		CacheEntry
	> /* REVIEW: ConcurrentDictionary */ = new Map();

	/** @internal */ removeEntry(
		entry: CacheEntry,
		options: MemoryCacheOptions,
	): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}

// https://source.dot.net/#Microsoft.Extensions.Caching.Memory/MemoryCache.cs,99099576db12fef5,references
export class MemoryCache implements IMemoryCache {
	/** @internal */ readonly logger: ILogger;

	private readonly options: MemoryCacheOptions;

	private readonly allStats:
		| List<Stats /* TODO: WeakReference */>
		| undefined;
	private coherentState: CoherentState;
	private disposed = false;
	private lastExpirationScan: number;

	/** @internal */ readonly trackLinkedCacheEntries: boolean;

	constructor(
		optionsAccessor: IOptions<MemoryCacheOptions>,
		loggerFactory: ILoggerFactory,
	) {
		this.options = optionsAccessor.getValue(MemoryCacheOptions);
		this.logger = loggerFactory.createLogger(MemoryCache.name);

		this.coherentState = new CoherentState();

		if (this.options.trackStatistics) {
			this.allStats = new List();
		}

		this.lastExpirationScan = this.utcNow;
		this.trackLinkedCacheEntries = this.options.trackLinkedCacheEntries; // we store the setting now so it's consistent for entire MemoryCache lifetime
	}

	private get utcNow(): number {
		return Date.now();
	}

	private checkDisposed(): void {
		if (this.disposed) {
			throw new Error('Cannot access a disposed object.' /* LOC */);
		}
	}

	// Called by multiple actions to see how long it's been since we last checked for expired items.
	// If sufficient time has elapsed then a scan is initiated on a background task.
	private startScanForExpiredItemsIfNeeded(utcNow: number): void {
		if (
			this.options.expirationScanFrequency <
			utcNow - this.lastExpirationScan
		) {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	tryGetValue(
		key: string /* TODO: object */,
	): Result<object | undefined, undefined> {
		this.checkDisposed();

		const utcNow = this.utcNow;

		const coherentState = this.coherentState; // clear() can update the reference in the meantime
		const tryGetValueResult = tryGetValue(coherentState.entries, key);
		if (tryGetValueResult.ok) {
			const entry = tryGetValueResult.val;
			// Check if expired due to expiration tokens, timers, etc. and if so, remove it.
			// Allow a stale Replaced value to be returned due to concurrent calls to SetExpired during SetEntry.
			if (
				!entry.checkExpired(utcNow) ||
				entry.evictionReason === EvictionReason.Replaced
			) {
				entry.lastAccessed = utcNow;

				if (this.trackLinkedCacheEntries) {
					// When this entry is retrieved in the scope of creating another entry,
					// that entry needs a copy of these expiration tokens.
					entry.propagateOptionsToCurrent();
				}

				this.startScanForExpiredItemsIfNeeded(utcNow);
				// Hit
				if (this.allStats !== undefined) {
					// TODO
					throw new Error('Method not implemented.');
				}

				return new Ok(entry.value);
			} else {
				// TODO: For efficiency queue this up for batch removal
				coherentState.removeEntry(entry, this.options);
			}
		}

		this.startScanForExpiredItemsIfNeeded(utcNow);

		// Miss
		if (this.allStats !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}

		return new Err(undefined);
	}

	[Symbol.dispose](): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
