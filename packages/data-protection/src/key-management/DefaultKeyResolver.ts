import { Guid, Out, TimeSpan } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';

import { IKey } from './IKey';
import { isExpired } from './KeyExtensions';
import { KeyManagementOptions } from './KeyManagementOptions';
import { DefaultKeyResolution } from './internal/DefaultKeyResolution';
import { IDefaultKeyResolver } from './internal/IDefaultKeyResolver';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,ae1ffc8dd2a274e3,references
function logKeyIsIneligibleToBeTheDefaultKeyBecauseItsMethodFailed(
	logger: ILogger,
	keyId: Guid,
	methodName: string,
): void {
	logger.log(
		LogLevel.Warning,
		`Key ${
			keyId.toString(/* TODO: 'B' */)
		} is ineligible to be the default key because its ${methodName} method failed.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,c0cfbf543b895848,references
function logConsideringKeyWithExpirationDateAsDefaultKey(
	logger: ILogger,
	keyId: Guid,
	expirationDate: number,
): void {
	logger.log(
		LogLevel.Debug,
		`Considering key ${
			keyId.toString(/* TODO: 'B' */)
		} with expiration date ${
			expirationDate.toString(/* TODO: 'u' */)
		} as default key.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,cd1a985b99eac17c,references
function logKeyIsNoLongerUnderConsiderationAsDefault(
	logger: ILogger,
	keyId: Guid,
): void {
	logger.log(
		LogLevel.Debug,
		`Key ${
			keyId.toString(/* TODO: 'B' */)
		} is no longer under consideration as default key because it is expired, revoked, or cannot be deciphered.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,9a67a1b1d160ef64,references
function logDefaultKeyExpirationImminentAndRepository(logger: ILogger): void {
	logger.log(
		LogLevel.Debug,
		'Default key expiration imminent and repository contains no viable successor. Caller should generate a successor.',
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,b6fa1dcfcf47c092,references
function logRepositoryContainsNoViableDefaultKey(logger: ILogger): void {
	logger.log(
		LogLevel.Debug,
		'Repository contains no viable default key. Caller should generate a key with immediate activation.',
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/DefaultKeyResolver.cs,53f63ccf038547e9,references
export class DefaultKeyResolver implements IDefaultKeyResolver {
	private readonly keyPropagationWindow: TimeSpan;

	private readonly logger: ILogger;

	private readonly maxServerToServerClockSkew: TimeSpan;

	constructor(@inject(ILoggerFactory) loggerFactory: ILoggerFactory) {
		this.keyPropagationWindow = KeyManagementOptions.keyPropagationWindow;
		this.maxServerToServerClockSkew =
			KeyManagementOptions.maxServerClockSkew;
		this.logger = loggerFactory.createLogger(DefaultKeyResolver.name);
	}

	private canCreateAuthenticatedEncryptor(key: IKey): boolean {
		try {
			const encryptorInstance = key.createEncryptor();
			if (encryptorInstance === undefined) {
				throw new Error('CreateEncryptorInstance returned undefined.');
			}

			return true;
		} catch (error) {
			logKeyIsIneligibleToBeTheDefaultKeyBecauseItsMethodFailed(
				this.logger,
				key.keyId,
				'createEncryptor',
			);
			return false;
		}
	}

	// REVIEW
	private findDefaultKey(
		now: number,
		allKeys: Iterable<IKey>,
		fallbackKey: Out<IKey | undefined>,
		callerShouldGenerateNewKey: Out<boolean>,
	): IKey | undefined {
		// REVIEW
		// find the preferred default key (allowing for server-to-server clock skew)
		let preferredDefaultKey: IKey | undefined = Array.from(allKeys)
			.filter(
				(key) =>
					key.activationDate <=
					now + this.maxServerToServerClockSkew.totalMilliseconds,
			)
			.sort(
				(a, b) =>
					b.activationDate - a.activationDate ||
					a.keyId.toString().localeCompare(b.keyId.toString()),
			)[0];

		if (preferredDefaultKey !== undefined) {
			logConsideringKeyWithExpirationDateAsDefaultKey(
				this.logger,
				preferredDefaultKey.keyId,
				preferredDefaultKey.expirationDate,
			);

			// if the key has been revoked or is expired, it is no longer a candidate
			if (
				preferredDefaultKey.isRevoked ||
				isExpired(preferredDefaultKey, now) ||
				!this.canCreateAuthenticatedEncryptor(preferredDefaultKey)
			) {
				logKeyIsNoLongerUnderConsiderationAsDefault(
					this.logger,
					preferredDefaultKey.keyId,
				);
				preferredDefaultKey = undefined;
			}
		}

		// Only the key that has been most recently activated is eligible to be the preferred default,
		// and only if it hasn't expired or been revoked. This is intentional: generating a new key is
		// an implicit signal that we should stop using older keys (even if they're not revoked), so
		// activating a new key should permanently mark all older keys as non-preferred.

		if (preferredDefaultKey !== undefined) {
			// Does *any* key in the key ring fulfill the requirement that its activation date is prior
			// to the preferred default key's expiration date (allowing for skew) and that it will
			// remain valid one propagation cycle from now? If so, the caller doesn't need to add a
			// new key.
			const callerShouldGenerateNewKeyValue = !Array.from(allKeys).some(
				(key) =>
					key.activationDate <=
						preferredDefaultKey!.expirationDate +
							this.maxServerToServerClockSkew.totalMilliseconds &&
					!isExpired(
						key,
						now + this.keyPropagationWindow.totalMilliseconds,
					) &&
					!key.isRevoked,
			);
			callerShouldGenerateNewKey.set(callerShouldGenerateNewKeyValue);

			if (callerShouldGenerateNewKeyValue) {
				logDefaultKeyExpirationImminentAndRepository(this.logger);
			}

			fallbackKey.set(undefined);
			return preferredDefaultKey;
		}

		// If we got this far, the caller must generate a key now.
		// We should locate a fallback key, which is a key that can be used to protect payloads if
		// the caller is configured not to generate a new key. We should try to make sure the fallback
		// key has propagated to all callers (so its creation date should be before the previous
		// propagation period), and we cannot use revoked keys. The fallback key may be expired.
		fallbackKey.set(
			Array.from(allKeys)
				.filter(
					(key) =>
						key.creationDate <=
						now - this.keyPropagationWindow.totalMilliseconds,
				)
				.sort((a, b) => b.creationDate - a.creationDate)
				.concat(
					Array.from(allKeys).sort(
						(a, b) => a.creationDate - b.creationDate,
					),
				)
				.filter(
					(key) =>
						!key.isRevoked &&
						this.canCreateAuthenticatedEncryptor(key),
				)[0],
		);

		logRepositoryContainsNoViableDefaultKey(this.logger);

		callerShouldGenerateNewKey.set(true);
		return undefined;
	}

	resolveDefaultKeyPolicy(
		now: number,
		allKeys: Iterable<IKey>,
	): DefaultKeyResolution {
		const retVal = new DefaultKeyResolution();
		retVal.defaultKey = this.findDefaultKey(
			now,
			allKeys,
			{ set: (value) => (retVal.fallbackKey = value) },
			{ set: (value) => (retVal.shouldGenerateNewKey = value) },
		);
		return retVal;
	}
}
