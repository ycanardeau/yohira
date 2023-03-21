import {
	BinaryWriter,
	Guid,
	MemoryStream,
	Out,
	SeekOrigin,
	using,
} from '@yohira/base';
import { IDataProtector } from '@yohira/data-protection.abstractions';
import { ILogger, LogLevel } from '@yohira/extensions.logging.abstractions';

import { IPersistedDataProtector } from '../IPersistedDataProtector';
import { isDebugLevelEnabled, isTraceLevelEnabled } from '../LoggingExtensions';
import { encrypt } from '../authenticated-encryption/AuthenticatedEncryptorExtensions';
import { CryptographicError } from './CryptographicError';
import { KeyRingProvider } from './KeyRingProvider';
import { IKeyRingProvider } from './internal/IKeyRingProvider';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,d74adcb73a7fb357,references
function performingProtectOperationToKeyWithPurposes(
	logger: ILogger,
	keyId: Guid,
	purposes: string,
): void {
	logger.log(
		LogLevel.Trace,
		`Performing protect operation to key ${
			keyId /* TODO: :B */
		} with purposes ${purposes}.` /* LOC */,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,548a69640d62f161,references
function keyWasNotFoundInTheKeyRingUnprotectOperationCannotProceed(
	logger: ILogger,
	keyId: Guid,
): void {
	logger.log(
		LogLevel.Trace,
		`Key ${
			keyId.toString(/* TODO: 'B' */)
		} was not found in the key ring. Unprotect operation cannot proceed.`,
	);
}

const sizeofUint32 = 4;
const sizeofGuid = 16;

// This magic header identifies a v0 protected data blob. It's the high 28 bits of the SHA1 hash of
// "Microsoft.AspNet.DataProtection.KeyManagement.KeyRingBasedDataProtector" [US-ASCII], big-endian.
// The last nibble reserved for version information. There's also the nice property that "F0 C9"
// can never appear in a well-formed UTF8 sequence, so attempts to treat a protected payload as a
// UTF8-encoded string will fail, and devs can catch the mistake early.
const MAGIC_HEADER_V0 = 0x09f0c9f0;

function readGuid(buffer: Buffer): Guid {
	return Guid.fromBuffer(buffer);
}

export function writeGuid(buffer: Buffer, key: Guid): void {
	key.toBuffer().copy(buffer);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyRingBasedDataProtector.cs,afe599dd167a3f3b,references
class AdditionalAuthenticatedDataTemplate {
	private aadTemplate: Buffer;

	constructor(purposes: readonly string[]) {
		const MEMORYSTREAM_DEFAULT_CAPACITY = 0x100; // matches MemoryStream.EnsureCapacity
		const ms = MemoryStream.alloc(MEMORYSTREAM_DEFAULT_CAPACITY);

		using(new BinaryWriter(ms), (writer) => {
			writer.writeUint32BE(MAGIC_HEADER_V0);
			if (ms.position !== sizeofUint32) {
				throw new Error('Assertion failed.');
			}
			const posPurposeCount = writer.seek(sizeofGuid, SeekOrigin.Current); // skip over where the key id will be stored; we'll fill it in later
			writer.seek(sizeofUint32, SeekOrigin.Current);

			let purposeCount = 0;
			for (const purpose of purposes) {
				if (purpose === undefined) {
					throw new Error('Assertion failed.');
				}
				writer.writeString(purpose); // prepends length as a 7-bit encoded integer
				purposeCount++;
			}

			// Once we have written all the purposes, go back and fill in 'purposeCount'
			writer.seek(posPurposeCount, SeekOrigin.Begin);
			writer.writeUint32BE(purposeCount);
		});

		this.aadTemplate = ms.toBuffer();
	}

	getAadForKey(keyId: Guid, isProtecting: boolean): Buffer {
		// REVIEW: Volatile.Read
		const existingTemplate = this.aadTemplate;
		if (
			existingTemplate.length <
			sizeofUint32 /* MAGIC_HEADER */ + sizeofGuid /* keyId */
		) {
			throw new Error('Assertion failed.');
		}

		// If the template is already initialized to this key id, return it.
		// The caller will not mutate it.
		if (
			readGuid(
				existingTemplate.subarray(
					sizeofUint32,
					sizeofUint32 + sizeofGuid,
				),
			) === keyId
		) {
			return existingTemplate;
		}

		// Clone since we're about to make modifications.
		// If this is an encryption operation, we only ever encrypt to the default key,
		// so we should replace the existing template. This could occur after the protector
		// has already been created, such as when the underlying key ring has been modified.
		const newTemplate = Buffer.from(existingTemplate);
		writeGuid(
			newTemplate.subarray(sizeofUint32, sizeofUint32 + sizeofGuid),
			keyId,
		);
		if (isProtecting) {
			// REVIEW: Volatile.Write
			this.aadTemplate = newTemplate;
		}
		return newTemplate;
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyRingBasedDataProtector.cs,13e9f8b3e9fd8373,references
enum UnprotectStatus {
	Ok,
	DefaultEncryptionKeyChanged,
	DecryptionKeyWasRevoked,
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyRingBasedDataProtector.cs,647bfb7ce8c4cba7,references
export class KeyRingBasedDataProtector
	implements IDataProtector, IPersistedDataProtector
{
	readonly purposes: string[];
	private readonly aadTemplate: AdditionalAuthenticatedDataTemplate;

	private static concatPurposes(
		originalPurposes: string[] | undefined,
		newPurpose: string,
	): string[] {
		if (originalPurposes !== undefined && originalPurposes.length > 0) {
			const newPurposes = new Array(originalPurposes.length + 1);
			for (let i = 0; i < originalPurposes.length; i++) {
				newPurposes[i] = originalPurposes[i];
			}
			newPurposes[originalPurposes.length] = newPurpose;
			return newPurposes;
		} else {
			return [newPurpose];
		}
	}

	constructor(
		private readonly keyRingProvider: IKeyRingProvider,
		private readonly logger: ILogger | undefined,
		originalPurposes: string[] | undefined,
		newPurpose: string,
	) {
		this.purposes = KeyRingBasedDataProtector.concatPurposes(
			originalPurposes,
			newPurpose,
		);
		this.aadTemplate = new AdditionalAuthenticatedDataTemplate(
			this.purposes,
		);
	}

	createProtector(purpose: string): IDataProtector {
		// TODO
		throw new Error('Method not implemented.');
	}

	private static joinPurposesForLog(purposes: readonly string[]): string {
		return `(${purposes.map((p) => `'${p}'`).join(', ')})`;
	}

	protect(plaintext: Buffer): Buffer {
		if (plaintext === undefined) {
			throw new Error('Value cannot be null.');
		}

		try {
			// Perform the encryption operation using the current default encryptor.
			const currentKeyRing = this.keyRingProvider.getCurrentKeyRing();
			const defaultKeyId = currentKeyRing.defaultKeyId;
			const defaultEncryptorInstance =
				currentKeyRing.defaultAuthenticatedEncryptor;
			if (defaultEncryptorInstance === undefined) {
				throw new Error('Assertion failed.');
			}

			if (this.logger !== undefined && isDebugLevelEnabled(this.logger)) {
				performingProtectOperationToKeyWithPurposes(
					this.logger,
					defaultKeyId,
					KeyRingBasedDataProtector.joinPurposesForLog(this.purposes),
				);
			}

			// We'll need to apply the default key id to the template if it hasn't already been applied.
			// If the default key id has been updated since the last call to Protect, also write back the updated template.
			const aad = this.aadTemplate.getAadForKey(defaultKeyId, true);

			// We allocate a 20-byte pre-buffer so that we can inject the magic header and key id into the return value.
			const retVal = encrypt(
				defaultEncryptorInstance,
				Buffer.from(plaintext),
				aad,
				sizeofUint32 + sizeofGuid,
				0,
			);
			if (
				retVal === undefined ||
				retVal.length < sizeofUint32 + sizeofGuid
			) {
				throw new Error('Assertion failed.');
			}

			// At this point: retVal := { 000..000 || encryptorSpecificProtectedPayload },
			// where 000..000 is a placeholder for our magic header and key id.

			// Write out the magic header and key id
			retVal.subarray(0, sizeofUint32).writeUint32BE(MAGIC_HEADER_V0);
			writeGuid(
				retVal.subarray(sizeofUint32, sizeofUint32 + sizeofGuid),
				defaultKeyId,
			);

			// At this point, retVal := { magicHeader || keyId || encryptorSpecificProtectedPayload }
			// And we're done!
			return retVal;
		} catch (error) {
			if (!(error instanceof Error)) {
				throw new Error(/* TODO: message */);
			}

			// homogenize all errors to CryptographicException
			if (error instanceof CryptographicError) {
				throw error;
			} else {
				throw new CryptographicError(
					'An error occurred while trying to encrypt the provided data. Refer to the inner exception for more information.' /* LOC */,
					error,
				);
			}
		}
	}

	private static tryGetVersionFromMagicHeader(
		magicHeader: number,
		version: Out<number>,
	): boolean {
		const MAGIC_HEADER_VERSION_MASK = 0xf;
		if ((magicHeader & ~MAGIC_HEADER_VERSION_MASK) === MAGIC_HEADER_V0) {
			version.set(magicHeader & MAGIC_HEADER_VERSION_MASK);
			return true;
		} else {
			version.set(0);
			return false;
		}
	}

	private unprotectCore(
		protectedData: Buffer,
		allowOperationsOnRevokedKeys: boolean,
		status: Out<UnprotectStatus>,
	): Buffer {
		if (protectedData === undefined) {
			throw new Error('Assertion failed.');
		}

		try {
			// argument & state checking
			if (
				protectedData.length <
				sizeofUint32 /* magic header */ + sizeofGuid /* key id */
			) {
				throw new CryptographicError(
					'The provided payload cannot be decrypted because it was not protected with this protection provider.' /* LOC */,
				);
			}

			// Need to check that protectedData := { magicHeader || keyId || encryptorSpecificProtectedPayload }

			// Parse the payload version number and key id.

			const magicHeaderFromPayload = protectedData
				.subarray(0, sizeofUint32)
				.readInt32BE();
			const keyIdFromPayload = readGuid(
				protectedData.subarray(sizeofUint32, sizeofUint32 + sizeofGuid),
			);

			// Are the magic header and version information correct?
			let payloadVersion = 0;
			if (
				!KeyRingBasedDataProtector.tryGetVersionFromMagicHeader(
					magicHeaderFromPayload,
					{ set: (value) => (payloadVersion = value) },
				)
			) {
				throw new CryptographicError(
					'The provided payload cannot be decrypted because it was not protected with this protection provider.' /* LOC */,
				);
			} else if (payloadVersion !== 0) {
				throw new CryptographicError(
					'The provided payload cannot be decrypted because it was protected with a newer version of the protection provider.' /* LOC */,
				);
			}

			if (this.logger !== undefined && isDebugLevelEnabled(this.logger)) {
				performingProtectOperationToKeyWithPurposes(
					this.logger,
					keyIdFromPayload,
					KeyRingBasedDataProtector.joinPurposesForLog(this.purposes),
				);
			}

			// Find the correct encryptor in the keyring.
			let keyWasRevoked = false;
			const currentKeyRing = this.keyRingProvider.getCurrentKeyRing();
			const requestedEncryptor =
				currentKeyRing.getAuthenticatedEncryptorByKeyId(
					keyIdFromPayload,
					{ set: (value) => (keyWasRevoked = value) },
				);
			if (requestedEncryptor === undefined) {
				/* TODO: if (
					this.keyRingProvider instanceof KeyRingProvider &&
					this.keyRingProvider.inAutoRefreshWindow()
				) {
					// TODO
					throw new Error('Method not implemented.');
				} */

				if (requestedEncryptor === undefined) {
					if (
						this.logger !== undefined &&
						isTraceLevelEnabled(this.logger)
					) {
						keyWasNotFoundInTheKeyRingUnprotectOperationCannotProceed(
							this.logger,
							keyIdFromPayload,
						);
					}
					throw new CryptographicError(
						`The key ${
							keyIdFromPayload.toString(/* TODO: 'B' */)
						} was not found in the key ring.` /* LOC */,
					);
				}
			}

			// TODO
			throw new Error('Method not implemented.');
		} catch (error) {
			if (!(error instanceof Error)) {
				throw new Error(/* TODO: message */);
			}

			// homogenize all errors to CryptographicException
			if (error instanceof CryptographicError) {
				throw error;
			} else {
				throw new CryptographicError(
					'The provided payload could not be decrypted. Refer to the inner exception for more information.' /* LOC */,
					error,
				);
			}
		}
	}

	// allows decrypting payloads whose keys have been revoked
	dangerousUnprotect(
		protectedData: Buffer,
		ignoreRevocationErrors: boolean,
		requiresMigration: Out<boolean>,
		wasRevoked: Out<boolean>,
	): Buffer {
		// argument & state checking
		if (protectedData === undefined) {
			throw new Error('Value cannot be null.');
		}

		let status = UnprotectStatus.Ok as UnprotectStatus;
		const retVal = this.unprotectCore(
			protectedData,
			ignoreRevocationErrors,
			{ set: (value) => (status = value) },
		);
		requiresMigration.set(status !== UnprotectStatus.Ok);
		wasRevoked.set(status === UnprotectStatus.DecryptionKeyWasRevoked);
		return retVal;
	}

	unprotect(protectedData: Buffer): Buffer {
		if (protectedData === undefined) {
			throw new Error('Value cannot be null.' /* LOC */);
		}

		// Argument checking will be done by the callee
		return this.dangerousUnprotect(
			protectedData,
			false,
			{ set: () => {} },
			{ set: () => {} },
		);
	}
}
