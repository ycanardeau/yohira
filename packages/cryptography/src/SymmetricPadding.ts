import { randomBytes } from 'node:crypto';

import { PaddingMode } from './PaddingMode';

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/SymmetricPadding.cs,fc13c5c7e7e7c963,references
export function getCiphertextLength(
	plaintextLength: number,
	paddingSizeInBytes: number,
	paddingMode: PaddingMode,
): number {
	if (plaintextLength < 0) {
		throw new Error('Assertion failed.');
	}

	//divisor and factor are same and won't overflow.
	const wholeBlocks =
		Math.floor(plaintextLength / paddingSizeInBytes) * paddingSizeInBytes;
	const remainder = plaintextLength % paddingSizeInBytes;

	switch (paddingMode) {
		case PaddingMode.None:
			if (remainder !== 0) {
				throw new Error(
					'The input data is not a complete block.' /* LOC */,
				);
			} else {
				return plaintextLength;
			}
		case PaddingMode.Zeros:
			if (remainder === 0) {
				return plaintextLength;
			} else {
				return wholeBlocks + paddingSizeInBytes;
			}
		case PaddingMode.PKCS7:
		case PaddingMode.ANSIX923:
		case PaddingMode.ISO10126:
			return wholeBlocks + paddingSizeInBytes;
		default:
			throw new Error(`Unknown padding mode ${paddingMode}.`);
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/SymmetricPadding.cs,9b0c00154a4ea3d2,references
export function padBlock(
	block: Buffer,
	destination: Buffer,
	paddingSizeInBytes: number,
	paddingMode: PaddingMode,
): number {
	const count = block.length;
	const paddingRemainder = count % paddingSizeInBytes;
	let padBytes = paddingSizeInBytes - paddingRemainder;

	switch (paddingMode) {
		case PaddingMode.None:
			if (paddingRemainder !== 0) {
				throw new Error(
					'The input data is not a complete block.' /* LOC */,
				);
			} else {
				if (destination.length < count) {
					throw new Error('Destination is too short.' /* LOC */);
				}

				block.copy(destination);
				return count;
			}

		// ANSI padding fills the blocks with zeros and adds the total number of padding bytes as
		// the last pad byte, adding an extra block if the last block is complete.
		//
		// xx 00 00 00 00 00 00 07
		case PaddingMode.ANSIX923:
			const ansiSize = count + padBytes;

			if (destination.length < ansiSize) {
				throw new Error('Destination is too short.' /* LOC */);
			}

			block.copy(destination);
			destination.subarray(count, count + padBytes - 1).fill(0);
			destination[count + padBytes - 1] = padBytes;
			return ansiSize;

		// ISO padding fills the blocks up with random bytes and adds the total number of padding
		// bytes as the last pad byte, adding an extra block if the last block is complete.
		//
		// xx rr rr rr rr rr rr 07
		case PaddingMode.ISO10126:
			const isoSize = count + padBytes;

			if (destination.length < isoSize) {
				throw new Error('Destination is too short.' /* LOC */);
			}

			block.copy(destination);
			randomBytes(count + padBytes - 1).copy(
				destination.subarray(count, count + padBytes - 1),
			);
			destination[count + padBytes - 1] = padBytes;
			return isoSize;

		// PKCS padding fills the blocks up with bytes containing the total number of padding bytes
		// used, adding an extra block if the last block is complete.
		//
		// xx xx 06 06 06 06 06 06
		case PaddingMode.PKCS7:
			const pkcsSize = count + padBytes;

			if (destination.length < pkcsSize) {
				throw new Error('Destination is too short.' /* LOC */);
			}

			block.copy(destination);
			destination.subarray(count, count + padBytes).fill(padBytes);
			return pkcsSize;

		// Zeros padding fills the last partial block with zeros, and does not add a new block to
		// the end if the last block is already complete.
		//
		//  xx 00 00 00 00 00 00 00
		case PaddingMode.Zeros:
			if (padBytes === paddingSizeInBytes) {
				padBytes = 0;
			}

			const zeroSize = count + padBytes;

			if (destination.length < zeroSize) {
				throw new Error('Destination is too short.' /* LOC */);
			}

			block.copy(destination);
			destination.subarray(count, padBytes).fill(0);
			return zeroSize;

		default:
			throw new Error('Unknown padding mode used.' /* LOC */);
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/SymmetricPadding.cs,e61726e791ed0408,references
export function depaddingRequired(padding: PaddingMode): boolean {
	// Some padding modes encode sufficient information to allow for automatic depadding to happen.
	switch (padding) {
		case PaddingMode.PKCS7:
		case PaddingMode.ANSIX923:
		case PaddingMode.ISO10126:
			return true;
		case PaddingMode.Zeros:
		case PaddingMode.None:
			return false;
		default:
			throw new Error(`Unknown padding mode ${padding}.`);
	}
}

// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/SymmetricPadding.cs,ca240106b45e69f8,references
export function getPaddingLength(
	block: Buffer,
	paddingMode: PaddingMode,
	blockSize: number,
): number {
	let padBytes: number;

	// See padBlock for a description of the padding modes.
	switch (paddingMode) {
		case PaddingMode.ANSIX923:
			padBytes = block[block.length - 1];

			// Verify the amount of padding is reasonable
			if (padBytes <= 0 || padBytes > blockSize) {
				throw new Error(
					'Padding is invalid and cannot be removed.' /* LOC */,
				);
			}

			// Verify that all the padding bytes are 0s
			// TODO
			throw new Error('Method not implemented.');

			break;

		case PaddingMode.ISO10126:
			padBytes = block[block.length - 1];

			// Verify the amount of padding is reasonable
			if (padBytes <= 0 || padBytes > blockSize) {
				throw new Error(
					'Padding is invalid and cannot be removed.' /* LOC */,
				);
			}

			// Since the padding consists of random bytes, we cannot verify the actual pad bytes themselves
			break;

		case PaddingMode.PKCS7:
			padBytes = block[block.length - 1];

			// Verify the amount of padding is reasonable
			if (padBytes <= 0 || padBytes > blockSize) {
				throw new Error(
					'Padding is invalid and cannot be removed.' /* LOC */,
				);
			}

			// Verify all the padding bytes match the amount of padding
			for (let i = block.length - padBytes; i < block.length - 1; i++) {
				if (block[i] !== padBytes) {
					throw new Error(
						'Padding is invalid and cannot be removed.' /* LOC */,
					);
				}
			}

			break;

		// We cannot remove Zeros padding because we don't know if the zeros at the end of the block
		// belong to the padding or the plaintext itself.
		case PaddingMode.Zeros:
		case PaddingMode.None:
			padBytes = 0;
			break;

		default:
			throw new Error('Unknown padding mode used.' /* LOC */);
	}

	return block.length - padBytes;
}
