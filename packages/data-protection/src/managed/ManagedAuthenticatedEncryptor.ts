import { MemoryStream, using } from '@yohira/base';
import {
	CryptoStream,
	CryptoStreamMode,
	HMACSHA512,
	HashAlgorithm,
	KeyedHashAlgorithm,
	PaddingMode,
	SymmetricAlgorithm,
} from '@yohira/cryptography';

import { Secret } from '../Secret';
import { IAuthenticatedEncryptor } from '../authenticated-encryption/IAuthenticatedEncryptor';
import { CryptographicError } from '../key-management/CryptographicError';
import {
	deriveKeys,
	deriveKeysWithContextHeader,
} from '../sp800_108/ManagedSP800_108_CTR_HMACSHA512';
import { getDigestSizeInBytes } from './HashAlgorithmExtensions';
import { IManagedGenRandom } from './IManagedGenRandom';
import { ManagedGenrandomImpl } from './ManagedGenrandomImpl';
import { getBlockSizeInBytes } from './SymmetricAlgorithmExtensions';

const sizeofUint32 = 4;

// REVIEW
// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Managed/ManagedAuthenticatedEncryptor.cs,5ae5d9fd0d294a74,references
export class ManagedAuthenticatedEncryptor
	implements IAuthenticatedEncryptor, Disposable
{
	// Even when IVs are chosen randomly, CBC is susceptible to IV collisions within a single
	// key. For a 64-bit block cipher (like 3DES), we'd expect a collision after 2^32 block
	// encryption operations, which a high-traffic web server might perform in mere hours.
	// AES and other 128-bit block ciphers are less susceptible to this due to the larger IV
	// space, but unfortunately some organizations require older 64-bit block ciphers. To address
	// the collision issue, we'll feed 128 bits of entropy to the KDF when performing subkey
	// generation. This creates >= 192 bits total entropy for each operation, so we shouldn't
	// expect a collision until >= 2^96 operations. Even 2^80 operations still maintains a <= 2^-32
	// probability of collision, and this is acceptable for the expected KDK lifetime.
	private static readonly KEY_MODIFIER_SIZE_IN_BYTES = 128 / 8;

	private static readonly kdkPrfFactory: (key: Buffer) => HashAlgorithm = (
		key,
	) => new HMACSHA512(key); // currently hardcoded to SHA512

	private readonly contextHeader: Buffer;
	private readonly genRandom: IManagedGenRandom;
	private readonly symmetricAlgorithmFactory: () => SymmetricAlgorithm;
	private readonly symmetricAlgorithmBlockSizeInBytes: number;
	private readonly symmetricAlgorithmSubkeyLengthInBytes: number;
	private readonly validationAlgorithmDigestLengthInBytes: number;
	private readonly validationAlgorithmSubkeyLengthInBytes: number;
	private readonly validationAlgorithmFactory: () => KeyedHashAlgorithm;

	private createContextHeader(): Buffer {
		const EMPTY_BUFFER = Buffer.alloc(0);

		const retVal = Buffer.alloc(
			1 /* KDF alg */ +
				1 /* chaining mode */ +
				sizeofUint32 /* sym alg key size */ +
				sizeofUint32 /* sym alg block size */ +
				sizeofUint32 /* hmac alg key size */ +
				sizeofUint32 /* hmac alg digest size */ +
				this
					.symmetricAlgorithmBlockSizeInBytes /* ciphertext of encrypted empty string */ +
				this
					.validationAlgorithmDigestLengthInBytes /* digest of HMACed empty string */,
		);

		let idx = 0;

		// First is the two-byte header
		retVal[idx++] = 0; // 0x00 = SP800-108 CTR KDF w/ HMACSHA512 PRF
		retVal[idx++] = 0; // 0x00 = CBC encryption + HMAC authentication

		// Next is information about the symmetric algorithm (key size followed by block size)
		retVal.writeUint32BE(this.symmetricAlgorithmSubkeyLengthInBytes, idx);
		idx += sizeofUint32;
		retVal.writeUint32BE(this.symmetricAlgorithmBlockSizeInBytes, idx);
		idx += sizeofUint32;

		// Next is information about the keyed hash algorithm (key size followed by digest size)
		retVal.writeUint32BE(this.validationAlgorithmSubkeyLengthInBytes, idx);
		idx += 4;
		retVal.writeUint32BE(this.validationAlgorithmDigestLengthInBytes, idx);
		idx += 4;

		// See the design document for an explanation of the following code.
		const tempKeys = Buffer.alloc(
			this.symmetricAlgorithmSubkeyLengthInBytes +
				this.validationAlgorithmSubkeyLengthInBytes,
		);
		deriveKeys(
			EMPTY_BUFFER,
			EMPTY_BUFFER,
			EMPTY_BUFFER,
			ManagedAuthenticatedEncryptor.kdkPrfFactory,
			tempKeys /* REVIEW: ArraySegment */,
		);

		// At this point, tempKeys := { K_E || K_H }.

		// Encrypt a zero-length input string with an all-zero IV and copy the ciphertext to the return buffer.
		using(this.createSymmetricAlgorithm(), (symmetricAlg) => {
			using(
				symmetricAlg.createEncryptorCore(
					tempKeys.subarray(
						0,
						this.symmetricAlgorithmSubkeyLengthInBytes,
					) /* TODO: .asStandaloneArray() */,
					Buffer.alloc(this.symmetricAlgorithmBlockSizeInBytes),
				),
				(cryptoTransform) => {
					const ciphertext = cryptoTransform.transformFinalBlock(
						EMPTY_BUFFER,
						0,
						0,
					);
					if (
						ciphertext === undefined ||
						ciphertext.length !==
							this.symmetricAlgorithmBlockSizeInBytes
					) {
						throw new Error(
							'ciphertext != null && ciphertext.Length == _symmetricAlgorithmBlockSizeInBytes',
						);
					}
					ciphertext.copy(retVal, idx, 0, ciphertext.length);
				},
			);
		});

		idx += this.symmetricAlgorithmBlockSizeInBytes;

		// MAC a zero-length input string and copy the digest to the return buffer.
		using(
			this.createValidationAlgorithm(
				tempKeys.subarray(
					this.symmetricAlgorithmSubkeyLengthInBytes,
					this.symmetricAlgorithmSubkeyLengthInBytes +
						this.validationAlgorithmSubkeyLengthInBytes,
				),
			),
			(hashAlg) => {
				const digest = hashAlg.computeHash(EMPTY_BUFFER);
				if (
					digest === undefined ||
					digest.length !==
						this.validationAlgorithmDigestLengthInBytes
				) {
					throw new Error(
						'digest != null && digest.Length == _validationAlgorithmDigestLengthInBytes',
					);
				}
				digest.copy(retVal, idx, 0, digest.length);
			},
		);

		idx += this.validationAlgorithmDigestLengthInBytes;
		if (idx !== retVal.length) {
			throw new Error('idx == retVal.Length');
		}

		// retVal := { version || chainingMode || symAlgKeySize || symAlgBlockSize || macAlgKeySize || macAlgDigestSize || E("") || MAC("") }.
		return retVal;
	}

	constructor(
		private readonly keyDerivationKey: Secret,
		symmetricAlgorithmFactory: () => SymmetricAlgorithm,
		symmetricAlgorithmKeySizeInBytes: number,
		validationAlgorithmFactory: () => KeyedHashAlgorithm,
		genRandom?: IManagedGenRandom,
	) {
		this.genRandom = genRandom ?? ManagedGenrandomImpl.instance;
		// TODO

		// Validate that the symmetric algorithm has the properties we require
		const symmetricAlgorithm = symmetricAlgorithmFactory();
		try {
			this.symmetricAlgorithmFactory = symmetricAlgorithmFactory;
			this.symmetricAlgorithmBlockSizeInBytes =
				getBlockSizeInBytes(symmetricAlgorithm);
			this.symmetricAlgorithmSubkeyLengthInBytes =
				symmetricAlgorithmKeySizeInBytes;
		} finally {
			symmetricAlgorithm[Symbol.dispose]();
		}

		// Validate that the MAC algorithm has the properties we require
		const validationAlgorithm = validationAlgorithmFactory();
		try {
			this.validationAlgorithmFactory = validationAlgorithmFactory;
			this.validationAlgorithmDigestLengthInBytes =
				getDigestSizeInBytes(validationAlgorithm);
			this.validationAlgorithmSubkeyLengthInBytes =
				this.validationAlgorithmDigestLengthInBytes; // for simplicity we'll generate MAC subkeys with a length equal to the digest length
		} finally {
			validationAlgorithm[Symbol.dispose]();
		}

		// TODO: assert

		this.contextHeader = this.createContextHeader();
	}

	private createSymmetricAlgorithm(): SymmetricAlgorithm {
		const retVal = this.symmetricAlgorithmFactory();
		if (retVal === undefined) {
			throw new Error('retVal != undefined');
		}

		retVal.mode = 'cbc';
		retVal.padding = PaddingMode.PKCS7;
		return retVal;
	}

	private createValidationAlgorithm(key: Buffer): KeyedHashAlgorithm {
		const retVal = this.validationAlgorithmFactory();
		if (retVal === undefined) {
			throw new Error('retVal != undefined');
		}

		retVal.key = key;
		return retVal;
	}

	decrypt(
		protectedPayload: Buffer,
		additionalAuthenticatedData: Buffer,
	): Buffer {
		// TODO: protectedPayload.validate();
		// TODO: additionalAuthenticatedData.validate();

		// Argument checking - input must at the absolute minimum contain a key modifier, IV, and MAC
		if (
			protectedPayload.length <
			ManagedAuthenticatedEncryptor.KEY_MODIFIER_SIZE_IN_BYTES +
				this.symmetricAlgorithmBlockSizeInBytes +
				this.validationAlgorithmDigestLengthInBytes
		) {
			throw new CryptographicError('The payload was invalid.' /* LOC */);
		}

		// Assumption: protectedPayload := { keyModifier | IV | encryptedData | MAC(IV | encryptedPayload) }

		try {
			// Step 1: Extract the key modifier and IV from the payload.

			let keyModifierOffset: number; // position in protectedPayload.Array where key modifier begins
			let ivOffset: number; // position in protectedPayload.Array where key modifier ends / IV begins
			let ciphertextOffset: number; // position in protectedPayload.Array where IV ends / ciphertext begins
			let macOffset: number; // position in protectedPayload.Array where ciphertext ends / MAC begins
			let eofOffset: number; // position in protectedPayload.Array where MAC ends

			// TODO: checked
			{
				keyModifierOffset = 0;
				ivOffset =
					keyModifierOffset +
					ManagedAuthenticatedEncryptor.KEY_MODIFIER_SIZE_IN_BYTES;
				ciphertextOffset =
					ivOffset + this.symmetricAlgorithmBlockSizeInBytes;
			}

			const keyModifier = protectedPayload.subarray(
				keyModifierOffset,
				ivOffset,
			);
			const iv = Buffer.alloc(this.symmetricAlgorithmBlockSizeInBytes);
			protectedPayload.copy(iv, 0, ivOffset, ivOffset + iv.length);

			// Step 2: Decrypt the KDK and use it to restore the original encryption and MAC keys.
			// We pin all unencrypted keys to limit their exposure via GC relocation.

			const decryptedKdk = Buffer.alloc(this.keyDerivationKey.length);
			const decryptionSubkey = Buffer.alloc(
				this.symmetricAlgorithmSubkeyLengthInBytes,
			);
			const validationSubkey = Buffer.alloc(
				this.validationAlgorithmSubkeyLengthInBytes,
			);
			const derivedKeysBuffer = Buffer.alloc(
				decryptionSubkey.length + validationSubkey.length,
			);

			try {
				this.keyDerivationKey.writeSecretIntoBuffer(
					decryptedKdk /* REVIEW: ArraySegment */,
				);
				deriveKeysWithContextHeader(
					decryptedKdk,
					additionalAuthenticatedData,
					this.contextHeader,
					keyModifier,
					ManagedAuthenticatedEncryptor.kdkPrfFactory,
					derivedKeysBuffer /* REVIEW: ArraySegment */,
				);

				derivedKeysBuffer.copy(
					decryptionSubkey,
					0,
					0,
					decryptionSubkey.length,
				);
				derivedKeysBuffer.copy(
					validationSubkey,
					0,
					decryptionSubkey.length,
					decryptionSubkey.length + validationSubkey.length,
				);

				// Step 3: Calculate the correct MAC for this payload.
				// correctHash := MAC(IV || ciphertext)
				/* TODO: const correctHash = */ using(
					this.createValidationAlgorithm(validationSubkey),
					(hashAlgorithm) => {
						// TODO: checked
						{
							eofOffset = protectedPayload.length;
							macOffset =
								eofOffset -
								this.validationAlgorithmDigestLengthInBytes;
						}

						return hashAlgorithm.computeHash(
							protectedPayload,
							ivOffset,
							macOffset - ivOffset,
						);
					},
				);

				// Step 4: Validate the MAC provided as part of the payload.

				// TODO
				//throw new Error('Method not implemented.');

				// Step 5: Decipher the ciphertext and return it to the caller.

				return using(
					this.createSymmetricAlgorithm(),
					(symmetricAlgorithm) => {
						return using(
							symmetricAlgorithm.createDecryptorCore(
								decryptionSubkey,
								iv,
							),
							(cryptoTransform) => {
								const outputStream = MemoryStream.alloc();
								return using(
									new CryptoStream(
										outputStream,
										cryptoTransform,
										CryptoStreamMode.Write,
									),
									(cryptoStream) => {
										cryptoStream.write(
											protectedPayload,
											ciphertextOffset,
											macOffset - ciphertextOffset,
										);
										cryptoStream.flushFinalBlock();

										// At this point, outputStream := { plaintext }, and we're done!
										return outputStream.toBuffer();
									},
								);
							},
						);
					},
				);
			} finally {
				decryptedKdk.fill(0, 0, decryptedKdk.length);
				decryptionSubkey.fill(0, 0, decryptionSubkey.length);
				validationSubkey.fill(0, 0, validationSubkey.length);
				derivedKeysBuffer.fill(0, 0, derivedKeysBuffer.length);
			}
		} catch (error) {
			// Homogenize all exceptions to CryptographicException.
			throw new Error(
				'An error occurred during a cryptographic operation.' /* LOC */,
			);
		}
	}

	encrypt(plaintext: Buffer, additionalAuthenticatedData: Buffer): Buffer {
		// TODO: plaintext.validate();
		// TODO: additionalAuthenticatedData.validate();

		try {
			const outputStream = MemoryStream.alloc();

			// Step 1: Generate a random key modifier and IV for this operation.
			// Both will be equal to the block size of the block cipher algorithm.

			const keyModifier = this.genRandom.genRandom(
				ManagedAuthenticatedEncryptor.KEY_MODIFIER_SIZE_IN_BYTES,
			);
			const iv = this.genRandom.genRandom(
				this.symmetricAlgorithmBlockSizeInBytes,
			);

			// Step 2: Copy the key modifier and the IV to the output stream since they'll act as a header.

			outputStream.write(keyModifier, 0, keyModifier.length);
			outputStream.write(iv, 0, iv.length);

			// At this point, outputStream := { keyModifier || IV }.

			// Step 3: Decrypt the KDK, and use it to generate new encryption and HMAC keys.
			// We pin all unencrypted keys to limit their exposure via GC relocation.

			const decryptedKdk = Buffer.alloc(this.keyDerivationKey.length);
			const encryptionSubkey = Buffer.alloc(
				this.symmetricAlgorithmSubkeyLengthInBytes,
			);
			const validationSubkey = Buffer.alloc(
				this.validationAlgorithmSubkeyLengthInBytes,
			);
			const derivedKeysBuffer = Buffer.alloc(
				encryptionSubkey.length + validationSubkey.length,
			);

			try {
				this.keyDerivationKey.writeSecretIntoBuffer(decryptedKdk);
				deriveKeysWithContextHeader(
					decryptedKdk,
					additionalAuthenticatedData,
					this.contextHeader,
					keyModifier /* REVIEW: ArraySegment */,
					ManagedAuthenticatedEncryptor.kdkPrfFactory,
					derivedKeysBuffer /* REVIEW: ArraySegment */,
				);

				derivedKeysBuffer.copy(
					encryptionSubkey,
					0,
					0,
					encryptionSubkey.length,
				);
				derivedKeysBuffer.copy(
					validationSubkey,
					0,
					encryptionSubkey.length,
					encryptionSubkey.length + validationSubkey.length,
				);

				// Step 4: Perform the encryption operation.

				return using(
					this.createSymmetricAlgorithm(),
					(symmetricAlgorithm) => {
						return using(
							symmetricAlgorithm.createEncryptorCore(
								encryptionSubkey,
								iv,
							),
							(cryptoTransform) => {
								return using(
									new CryptoStream(
										outputStream,
										cryptoTransform,
										CryptoStreamMode.Write,
									),
									(cryptoStream) => {
										cryptoStream.write(
											plaintext,
											0,
											plaintext.length,
										);
										cryptoStream.flushFinalBlock();

										// At this point, outputStream := { keyModifier || IV || ciphertext }

										// Step 5: Calculate the digest over the IV and ciphertext.
										// We don't need to calculate the digest over the key modifier since that
										// value has already been mixed into the KDF used to generate the MAC key.

										return using(
											this.createValidationAlgorithm(
												validationSubkey,
											),
											(validationAlgorithm) => {
												// As an optimization, avoid duplicating the underlying buffer
												const underlyingBuffer =
													outputStream.getBuffer();

												const mac =
													validationAlgorithm.computeHash(
														underlyingBuffer,
														ManagedAuthenticatedEncryptor.KEY_MODIFIER_SIZE_IN_BYTES,
														outputStream.length -
															ManagedAuthenticatedEncryptor.KEY_MODIFIER_SIZE_IN_BYTES,
													);
												outputStream.write(
													mac,
													0,
													mac.length,
												);

												// At this point, outputStream := { keyModifier || IV || ciphertext || MAC(IV || ciphertext) }
												// And we're done!
												return outputStream.toBuffer();
											},
										);
									},
								);
							},
						);
					},
				);
			} finally {
				// delete since these contain secret material
				decryptedKdk.fill(0);
				encryptionSubkey.fill(0);
				validationSubkey.fill(0);
				derivedKeysBuffer.fill(0);
			}
		} catch (error) {
			// Homogenize all exceptions to CryptographicException.
			throw new Error(
				'An error occurred during a cryptographic operation.' /* LOC */,
			);
		}
	}

	[Symbol.dispose](): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
