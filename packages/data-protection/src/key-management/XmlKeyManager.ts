import { Guid, IReadonlyCollection, XElement, XName } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';

import { withoutChildNodes } from '../XmlExtensions';
import { IAuthenticatedEncryptorDescriptor } from '../authenticated-encryption/IAuthenticatedEncryptorDescriptor';
import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import { DefaultKeyStorageDirectories } from '../repositories/DefaultKeyStorageDirectories';
import { FileSystemXmlRepository } from '../repositories/FileSystemXmlRepository';
import { IDefaultKeyStorageDirectories } from '../repositories/IDefaultKeyStorageDirectories';
import { IXmlRepository } from '../repositories/IXmlRepository';
import { IXmlEncryptor } from '../xml-encryption/IXmlEncryptor';
import { DeferredKey } from './DeferredKey';
import { IKey } from './IKey';
import { IKeyManager } from './IKeyManager';
import { KeyBase } from './KeyBase';
import { KeyManagementOptions } from './KeyManagementOptions';
import { IInternalXmlKeyManager } from './internal/IInternalXmlKeyManager';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,0ed7371967fff387,references
function logUsingProfileAsKeyRepository(
	logger: ILogger,
	fullName: string,
): void {
	logger.log(
		LogLevel.Information,
		`User profile is available. Using '${fullName}' as key repository; keys will not be encrypted at rest.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,1e9fb721f499e6de,references
function logUsingProfileAsKeyRepositoryWithDPAPI(
	logger: ILogger,
	fullName: string,
): void {
	logger.log(
		LogLevel.Information,
		`User profile is available. Using '${fullName}' as key repository and Windows DPAPI to encrypt keys at rest.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,2f507fd733061ee4,references
function logUnknownElementWithNameFoundInKeyringSkipping(
	logger: ILogger,
	name: XName,
): void {
	logger.log(
		LogLevel.Warning,
		`Unknown element with name '${name}' found in keyring, skipping.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,89426c88b8787790,references
function logFoundKey(logger: ILogger, keyId: Guid): void {
	logger.log(LogLevel.Debug, `Found key ${keyId.toString(/* TODO: :B */)}.`);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,d83ff95647a0a08a,references
function logExceptionWhileProcessingKeyElement(
	logger: ILogger,
	element: XElement,
): void {
	logger.log(
		LogLevel.Error,
		`An exception occurred while processing the key element '${element}'.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,65eb8b5bff03c9da,references
function logAnExceptionOccurredWhileProcessingElementDebug(
	logger: ILogger,
	element: XElement,
): void {
	logger.log(
		LogLevel.Trace,
		`An exception occurred while processing the key element '${element}'.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/XmlKeyManager.cs,eb36a39c3e1e7c02,references
export class XmlKeyManager implements IKeyManager, IInternalXmlKeyManager {
	// Used for serializing elements to persistent storage
	/** @internal */ static readonly keyElementName = XName.get('key');
	/** @internal */ static readonly idAttributeName = XName.get('id');
	/** @internal */ static readonly versionAttributeName =
		XName.get('version');
	/** @internal */ static readonly creationDateElementName =
		XName.get('creationDate');
	/** @internal */ static readonly activationDateElementName =
		XName.get('activationDate');
	/** @internal */ static readonly expirationDateElementName =
		XName.get('expirationDate');
	/** @internal */ static readonly descriptorElementName =
		XName.get('descriptor');
	/** @internal */ static readonly deserializerTypeAttributeName =
		XName.get('deserializerType');
	/** @internal */ static readonly revocationElementName =
		XName.get('revocation');
	/** @internal */ static readonly revocationDateElementName =
		XName.get('revocationDate');
	/** @internal */ static readonly reasonElementName = XName.get('reason');

	private readonly internalKeyManager: IInternalXmlKeyManager;
	private readonly logger: ILogger;
	private readonly encryptorFactories: Iterable<IAuthenticatedEncryptorFactory>;
	private readonly keyStorageDirectories: IDefaultKeyStorageDirectories =
		DefaultKeyStorageDirectories.instance /* TODO: inject */;

	/** @internal */ readonly keyEncryptor: IXmlEncryptor | undefined;
	/** @internal */ readonly keyRepository: IXmlRepository;

	/** @internal */ getFallbackKeyRepositoryEncryptorPair(): [
		IXmlRepository,
		IXmlEncryptor | undefined,
	] {
		let repository: IXmlRepository | undefined = undefined;
		const encryptor: IXmlEncryptor | undefined = undefined;

		if (false /* TODO */) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			// If the user profile is available, store keys in the user profile directory.
			const localAppDataKeysFolder =
				this.keyStorageDirectories.getKeyStorageDirectory();
			if (localAppDataKeysFolder !== undefined) {
				// TODO
				repository = new FileSystemXmlRepository(
					localAppDataKeysFolder,
					this.loggerFactory,
				);

				if (encryptor !== undefined) {
					logUsingProfileAsKeyRepositoryWithDPAPI(
						this.logger,
						localAppDataKeysFolder.fullName,
					);
				} else {
					logUsingProfileAsKeyRepository(
						this.logger,
						localAppDataKeysFolder.fullName,
					);
				}
			} else {
				// TODO
				throw new Error('Method not implemented.');
			}
		}

		return [repository, encryptor];
	}

	constructor(
		@inject(Symbol.for('IOptions<KeyManagementOptions>'))
		keyManagementOptions: IOptions<KeyManagementOptions>,
		@inject(ILoggerFactory) private readonly loggerFactory: ILoggerFactory,
	) {
		this.logger = this.loggerFactory.createLogger(XmlKeyManager.name);
		// TODO

		let keyRepository =
			keyManagementOptions.getValue(KeyManagementOptions).xmlRepository;
		let keyEncryptor =
			keyManagementOptions.getValue(KeyManagementOptions).xmlEncryptor;
		if (keyRepository === undefined) {
			if (keyEncryptor !== undefined) {
				throw new Error(
					"The 'IXmlRepository' instance could not be found. When an 'IXmlEncryptor' instance is set, a corresponding 'IXmlRepository' instance must also be set." /* LOC */,
				);
			} else {
				const [key, value] =
					this.getFallbackKeyRepositoryEncryptorPair();
				keyRepository = key;
				keyEncryptor = value;
			}
		}

		this.keyRepository = keyRepository;
		this.keyEncryptor = keyEncryptor;

		// TODO

		// TODO
		this.internalKeyManager = /* TODO: this.internalKeyManager ?? */ this;
		this.encryptorFactories =
			keyManagementOptions.getValue(
				KeyManagementOptions,
			).authenticatedEncryptorFactories;
	}

	createNewKeyCore(
		keyId: Guid,
		creationDate: number,
		activationDate: number,
		expirationDate: number,
	): IKey {
		// TODO
		throw new Error('Method not implemented.');
	}

	createNewKey(activationDate: number, expirationDate: number): IKey {
		return this.internalKeyManager.createNewKeyCore(
			Guid.newGuid(),
			Date.now(),
			activationDate,
			expirationDate,
		);
	}

	private writeKeyDeserializationErrorToLog(
		error: Error,
		keyElement: XElement,
	): void {
		// Ideally we'd suppress the error since it might contain sensitive information, but it would be too difficult for
		// an administrator to diagnose the issue if we hide this information. Instead we'll log the error to the error
		// log and the raw <key> element to the debug log. This works for our out-of-box XML decryptors since they don't
		// include sensitive information in the exception message.

		// write sanitized <key> element
		logExceptionWhileProcessingKeyElement(
			this.logger,
			withoutChildNodes(keyElement),
		);

		// write full <key> element
		logAnExceptionOccurredWhileProcessingElementDebug(
			this.logger,
			keyElement,
		);
	}

	private processKeyElement(keyElement: XElement): KeyBase | undefined {
		if (keyElement.name !== XmlKeyManager.keyElementName) {
			throw new Error('Assertion failed.');
		}

		try {
			// Read metadata and prepare the key for deferred instantiation
			const keyId = Guid.fromString(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				keyElement.attribute(XmlKeyManager.idAttributeName)!.value,
			);
			const creationDate = new Date(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				keyElement.element(
					XmlKeyManager.creationDateElementName,
				)!.value,
			).getTime();
			const activationDate = new Date(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				keyElement.element(
					XmlKeyManager.activationDateElementName,
				)!.value,
			).getTime();
			const expirationDate = new Date(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				keyElement.element(
					XmlKeyManager.expirationDateElementName,
				)!.value,
			).getTime();

			logFoundKey(this.logger, keyId);

			return new DeferredKey(
				keyId,
				creationDate,
				activationDate,
				expirationDate,
				this,
				keyElement,
				this.encryptorFactories,
			);
		} catch (error) {
			if (error instanceof Error) {
				this.writeKeyDeserializationErrorToLog(error, keyElement);

				// Don't include this key in the key ring
				return undefined;
			} else {
				throw error;
			}
		}
	}

	getAllKeys(): readonly IKey[] {
		const allElements = this.keyRepository.getAllElements();
		const revokedKeyIds: Set<string /* TODO: Guid */> | undefined =
			undefined;
		const mostRecentMassRevocationDate: number | undefined = undefined;

		// We aggregate all the information we read into three buckets
		const keyIdToKeyMap = new Map<string /* TODO: Guid */, KeyBase>();

		for (const element of allElements) {
			if (element.name.equals(XmlKeyManager.keyElementName)) {
				// ProcessKeyElement can return null in the case of failure, and if this happens we'll move on.
				// Still need to throw if we see duplicate keys with the same id.
				const key = this.processKeyElement(element);
				if (key !== undefined) {
					if (keyIdToKeyMap.has(key.keyId.toString())) {
						throw new Error(
							`The key ${
								key.toString(/* TODO: 'B' */)
							} already exists in the keyring.` /* LOC */,
						);
					}
					keyIdToKeyMap.set(key.keyId.toString(), key);
				}
			} else if (
				element.name.equals(XmlKeyManager.revocationElementName)
			) {
				// TODO
				throw new Error('Method not implemented.');
			} else {
				// Skip unknown elements.
				logUnknownElementWithNameFoundInKeyringSkipping(
					this.logger,
					element.name,
				);
			}
		}

		// Apply individual revocations
		if (revokedKeyIds !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}

		// Apply mass revocations
		if (mostRecentMassRevocationDate !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}

		// And we're finished!
		return Array.from(keyIdToKeyMap.values());
	}

	getCacheExpirationToken(): void /* TODO: CancellationToken */ {
		// TODO
		//throw new Error('Method not implemented.');
	}

	deserializeDescriptorFromKeyElement(
		keyElement: XElement,
	): IAuthenticatedEncryptorDescriptor {
		// TODO
		throw new Error('Method not implemented.');
	}
}
