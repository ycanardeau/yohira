import {
	Aes,
	HMACSHA256,
	HMACSHA512,
	KeyedHashAlgorithm,
	SymmetricAlgorithm,
} from '@yohira/cryptography';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';

import { ISecret } from '../ISecret';
import { Secret } from '../Secret';
import { IKey } from '../key-management/IKey';
import { ManagedAuthenticatedEncryptor } from '../managed/ManagedAuthenticatedEncryptor';
import { IAuthenticatedEncryptor } from './IAuthenticatedEncryptor';
import { IAuthenticatedEncryptorFactory } from './IAuthenticatedEncryptorFactory';
import { ManagedAuthenticatedEncryptorConfig } from './conifg-model/ManagedAuthenticatedEncryptorConfig';
import { ManagedAuthenticatedEncryptorDescriptor } from './conifg-model/ManagedAuthenticatedEncryptorDescriptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,18f0622aa865c2a6,references
function logUsingManagedSymmetricAlgorithm(
	logger: ILogger,
	fullName: string,
): void {
	logger.log(
		LogLevel.Debug,
		`Using managed symmetric algorithm '${fullName}'.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,e3470b28356c41b4,references
function logUsingManagedKeyedHashAlgorithm(
	logger: ILogger,
	fullName: string,
): void {
	logger.log(
		LogLevel.Debug,
		`Using managed keyed hash algorithm '${fullName}'.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ManagedAuthenticatedEncryptorFactory.cs,a9f09a66f04a8986,references
export class ManagedAuthenticatedEncryptorFactory
	implements IAuthenticatedEncryptorFactory
{
	private readonly logger: ILogger;

	constructor(loggerFactory: ILoggerFactory) {
		this.logger = loggerFactory.createLogger(
			ManagedAuthenticatedEncryptorFactory.name,
		);
	}

	private getSymmetricBlockCipherAlgorithmFactory(
		config: ManagedAuthenticatedEncryptorConfig,
	): () => SymmetricAlgorithm {
		// basic argument checking
		if (config.encryptionAlgorithmType === undefined) {
			throw new Error(
				'Property encryptionAlgorithmType cannot be null or empty.' /* LOC */,
			);
		}
		// TODO
		if (config.encryptionAlgorithmKeySize < 0) {
			throw new Error(
				'Property encryptionAlgorithmKeySize must have a non-negative value.' /* LOC */,
			);
		}

		logUsingManagedSymmetricAlgorithm(
			this.logger,
			config.encryptionAlgorithmType.name,
		);

		if (config.encryptionAlgorithmType === Aes) {
			return Aes.create;
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	private getKeyedHashAlgorithmFactory(
		config: ManagedAuthenticatedEncryptorConfig,
	): () => KeyedHashAlgorithm {
		// basic argument checking
		if (config.validationAlgorithmType === undefined) {
			throw new Error(
				'Property validationAlgorithmType cannot be null or empty.',
			);
		}

		// TODO
		logUsingManagedKeyedHashAlgorithm(
			this.logger,
			config.validationAlgorithmType.name,
		);
		if (config.validationAlgorithmType === HMACSHA256) {
			return () => new HMACSHA256();
		} else if (config.validationAlgorithmType === HMACSHA512) {
			return () => new HMACSHA512();
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	/** @internal */ createAuthenticatedEncryptorInstance(
		secret: ISecret,
		config: ManagedAuthenticatedEncryptorConfig | undefined,
	): ManagedAuthenticatedEncryptor | undefined {
		if (config === undefined) {
			return undefined;
		}

		return new ManagedAuthenticatedEncryptor(
			Secret.fromSecret(secret),
			this.getSymmetricBlockCipherAlgorithmFactory(config),
			config.encryptionAlgorithmKeySize / 8,
			this.getKeyedHashAlgorithmFactory(config),
		);
	}

	createEncryptorInstance(key: IKey): IAuthenticatedEncryptor | undefined {
		if (
			!(key.descriptor instanceof ManagedAuthenticatedEncryptorDescriptor)
		) {
			return undefined;
		}

		return this.createAuthenticatedEncryptorInstance(
			key.descriptor.masterKey,
			key.descriptor.config,
		);
	}
}
