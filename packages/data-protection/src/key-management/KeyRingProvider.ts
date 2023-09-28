import { Guid, TimeSpan } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';

import { IKey } from './IKey';
import { IKeyManager } from './IKeyManager';
import { KeyManagementOptions } from './KeyManagementOptions';
import { KeyRing } from './KeyRing';
import { CacheableKeyRing } from './internal/CacheableKeyRing';
import { ICacheableKeyRingProvider } from './internal/ICacheableKeyRingProvider';
import { IDefaultKeyResolver } from './internal/IDefaultKeyResolver';
import { IKeyRing } from './internal/IKeyRing';
import { IKeyRingProvider } from './internal/IKeyRingProvider';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,bfec8e2d51c3ca79,references
function logPolicyResolutionStatesThatANewKeyShouldBeAddedToTheKeyRing(
	logger: ILogger,
): void {
	logger.log(
		LogLevel.Debug,
		'Policy resolution states that a new key should be added to the key ring.' /* LOC */,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,96563bcd92b83f09,references
function existingCachedKeyRingIsExpired(logger: ILogger): void {
	logger.log(
		LogLevel.Debug,
		'Existing cached key ring is expired. Refreshing.' /* LOC */,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,965866b7812935f1,references
function logUsingKeyAsDefaultKey(logger: ILogger, keyId: Guid): void {
	logger.log(
		LogLevel.Debug,
		`Using key ${keyId.toString(/* TODO: 'B' */)} as the default key.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyRingProvider.cs,7292fb503792df39,references
export class KeyRingProvider
	implements ICacheableKeyRingProvider, IKeyRingProvider
{
	private cacheableKeyRing: CacheableKeyRing | undefined;
	private readonly keyManagementOptions: KeyManagementOptions;
	private readonly logger: ILogger;

	// for testing
	/** @internal */ cacheableKeyRingProvider: ICacheableKeyRingProvider;

	/** @internal */ autoRefreshWindowEnd: number;

	constructor(
		@inject(IKeyManager)
		private readonly keyManager: IKeyManager,
		@inject(Symbol.for('IOptions<KeyManagementOptions>'))
		keyManagementOptions: IOptions<KeyManagementOptions>,
		@inject(IDefaultKeyResolver)
		private readonly defaultKeyResolver: IDefaultKeyResolver,
		@inject(ILoggerFactory)
		loggerFactory: ILoggerFactory,
	) {
		this.keyManagementOptions = new KeyManagementOptions(
			keyManagementOptions.getValue(KeyManagementOptions),
		); // clone so new instance is immutable
		this.cacheableKeyRingProvider = this;
		this.logger = loggerFactory.createLogger(KeyRingProvider.name);

		// We will automatically refresh any unknown keys for 2 minutes see https://github.com/dotnet/aspnetcore/issues/3975
		this.autoRefreshWindowEnd =
			Date.now() + TimeSpan.fromMinutes(2).totalMilliseconds;
	}

	inAutoRefreshWindow(): boolean {
		return Date.now() < this.autoRefreshWindowEnd;
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
		return this.getCurrentKeyRingCore(Date.now());
	}

	/** @internal */ refreshCurrentKeyRing(): IKeyRing {
		return this.getCurrentKeyRingCore(Date.now(), true);
	}

	private static getRefreshPeriodWithJitter(
		refreshPeriod: TimeSpan,
	): TimeSpan {
		// We'll fudge the refresh period up to -20% so that multiple applications don't try to
		// hit a single repository simultaneously. For instance, if the refresh period is 1 hour,
		// we'll return a value in the vicinity of 48 - 60 minutes. We use the Random class since
		// we don't need a secure PRNG for this.
		return TimeSpan.fromTicks(
			refreshPeriod.ticks * (1.0 - Math.random() / 5),
		);
	}

	private static min(a: number, b: number): number {
		return a < b ? a : b;
	}

	private createCacheableKeyRingCoreStep2(
		now: number,
		// TODO: cacheExpirationToken: CancellationToken,
		defaultKey: IKey,
		allKeys: Iterable<IKey>,
	): CacheableKeyRing {
		if (defaultKey === undefined) {
			throw new Error('Assertion failed.');
		}

		// Invariant: our caller ensures that CreateEncryptorInstance succeeded at least once
		if (defaultKey.createEncryptor() === undefined) {
			throw new Error('Assertion failed.');
		}

		logUsingKeyAsDefaultKey(this.logger, defaultKey.keyId);

		const nextAutoRefreshTime =
			now +
			KeyRingProvider.getRefreshPeriodWithJitter(
				KeyManagementOptions.keyRingRefreshPeriod,
			).totalMilliseconds;

		// The cached keyring should expire at the earliest of (default key expiration, next auto-refresh time).
		// Since the refresh period and safety window are not user-settable, we can guarantee that there's at
		// least one auto-refresh between the start of the safety window and the key's expiration date.
		// This gives us an opportunity to update the key ring before expiration, and it prevents multiple
		// servers in a cluster from trying to update the key ring simultaneously. Special case: if the default
		// key's expiration date is in the past, then we know we're using a fallback key and should disregard
		// its expiration date in favor of the next auto-refresh time.
		return new CacheableKeyRing(
			// TODO: cacheExpirationToken,
			defaultKey.expirationDate <= now
				? nextAutoRefreshTime
				: KeyRingProvider.min(
						defaultKey.expirationDate,
						nextAutoRefreshTime,
				  ),
			new KeyRing(defaultKey, allKeys),
		);
	}

	private createCacheableKeyRingCore(
		now: number,
		keyJustAdded: IKey | undefined,
	): CacheableKeyRing {
		// Refresh the list of all keys
		/* TODO: const cacheExpirationToken = */ this.keyManager.getCacheExpirationToken();
		const allKeys = this.keyManager.getAllKeys();

		// Fetch the current default key from the list of all keys
		const defaultKeyPolicy =
			this.defaultKeyResolver.resolveDefaultKeyPolicy(now, allKeys);
		if (!defaultKeyPolicy.shouldGenerateNewKey) {
			if (defaultKeyPolicy.defaultKey === undefined) {
				throw new Error('Assertion failed.');
			}
			return this.createCacheableKeyRingCoreStep2(
				now,
				// TODO: cacheExpirationToken,
				defaultKeyPolicy.defaultKey,
				allKeys,
			);
		}

		logPolicyResolutionStatesThatANewKeyShouldBeAddedToTheKeyRing(
			this.logger,
		);

		// We shouldn't call CreateKey more than once, else we risk stack diving. This code path shouldn't
		// get hit unless there was an ineligible key with an activation date slightly later than the one we
		// just added. If this does happen, then we'll just use whatever key we can instead of creating
		// new keys endlessly, eventually falling back to the one we just added if all else fails.
		if (keyJustAdded !== undefined) {
			const keyToUse =
				defaultKeyPolicy.defaultKey ??
				defaultKeyPolicy.fallbackKey ??
				keyJustAdded;
			return this.createCacheableKeyRingCoreStep2(
				now,
				// TODO: cacheExpirationToken,
				keyToUse,
				allKeys,
			);
		}

		// At this point, we know we need to generate a new key.

		// We have been asked to generate a new key, but auto-generation of keys has been disabled.
		// We need to use the fallback key or fail.
		if (!this.keyManagementOptions.autoGenerateKeys) {
			// TODO
			throw new Error('Method not implemented.');
		}

		if (defaultKeyPolicy.defaultKey === undefined) {
			// The case where there's no default key is the easiest scenario, since it
			// means that we need to create a new key with immediate activation.
			const newKey = this.keyManager.createNewKey(
				now,
				now +
					this.keyManagementOptions.newKeyLifetime.totalMilliseconds,
			);
			return this.createCacheableKeyRingCore(now, newKey); // recursively call
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	getCacheableKeyRing(now: number): CacheableKeyRing {
		// the entry point allows one recursive call
		return this.createCacheableKeyRingCore(now, undefined);
	}
}
