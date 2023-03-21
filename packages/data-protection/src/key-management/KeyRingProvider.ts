import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';

import { IKey } from './IKey';
import { IKeyManager } from './IKeyManager';
import { KeyManagementOptions } from './KeyManagementOptions';
import { CacheableKeyRing } from './internal/CacheableKeyRing';
import { ICacheableKeyRingProvider } from './internal/ICacheableKeyRingProvider';
import { IDefaultKeyResolver } from './internal/IDefaultKeyResolver';
import { IKeyRing } from './internal/IKeyRing';
import { IKeyRingProvider } from './internal/IKeyRingProvider';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,96563bcd92b83f09,references
function existingCachedKeyRingIsExpired(logger: ILogger): void {
	logger.log(
		LogLevel.Debug,
		'Existing cached key ring is expired. Refreshing.' /* LOC */,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyRingProvider.cs,7292fb503792df39,references
export class KeyRingProvider
	implements ICacheableKeyRingProvider, IKeyRingProvider
{
	private cacheableKeyRing?: CacheableKeyRing;
	private readonly keyManagementOptions: KeyManagementOptions;
	private readonly logger: ILogger;

	// for testing
	/* @internal */ cacheableKeyRingProvider: ICacheableKeyRingProvider;

	constructor(
		private readonly keyManager: IKeyManager,
		keyManagementOptions: IOptions<KeyManagementOptions>,
		private readonly defaultKeyResolver: IDefaultKeyResolver,
		loggerFactory: ILoggerFactory,
	) {
		this.keyManagementOptions = new KeyManagementOptions(
			keyManagementOptions.getValue(KeyManagementOptions),
		); // clone so new instance is immutable
		this.cacheableKeyRingProvider = this;
		this.logger = loggerFactory.createLogger(KeyRingProvider.name);

		// TODO
	}

	/** @internal */ getCurrentKeyRingCore(
		utcNow: number,
		forceRefresh = false,
	): IKeyRing {
		// TODO: assert

		// REVIEW: lock
		let existingCacheableKeyRing: CacheableKeyRing | undefined = undefined;
		if (!forceRefresh) {
			// REVIEW: Volatile.Read
			existingCacheableKeyRing = this.cacheableKeyRing;
			if (
				existingCacheableKeyRing !== undefined &&
				CacheableKeyRing.isValid(existingCacheableKeyRing, utcNow)
			) {
				return existingCacheableKeyRing.keyRing;
			}

			if (existingCacheableKeyRing !== undefined) {
				existingCachedKeyRingIsExpired(this.logger);
			}
		}

		// TODO: try
		const newCacheableKeyRing =
			this.cacheableKeyRingProvider.getCacheableKeyRing(utcNow);
		// TODO: catch

		// REVIEW: Volatile.Write
		this.cacheableKeyRing = newCacheableKeyRing;
		return newCacheableKeyRing.keyRing;
	}

	getCurrentKeyRing(): IKeyRing {
		return this.getCurrentKeyRingCore(Date.now() /* TODO */);
	}

	private createCacheableKeyRingCore(
		now: number,
		keyJustAdded: IKey | undefined,
	): CacheableKeyRing {
		// TODO
		throw new Error('Method not implemented.');
	}

	getCacheableKeyRing(now: number): CacheableKeyRing {
		// the entry point allows one recursive call
		return this.createCacheableKeyRingCore(now, undefined);
	}
}
