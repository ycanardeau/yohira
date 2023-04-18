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
	const padBytes = paddingSizeInBytes - paddingRemainder;

	switch (paddingMode) {
		case PaddingMode.None:
			if (paddingRemainder !== 0) {
				throw new Error(
					'The input data is not a complete block.' /* LOC */,
				);
			} else {
				// TODO
				throw new Error('Method not implemented.');
			}

		// ANSI padding fills the blocks with zeros and adds the total number of padding bytes as
		// the last pad byte, adding an extra block if the last block is complete.
		//
		// xx 00 00 00 00 00 00 07
		case PaddingMode.ANSIX923:
			// TODO
			throw new Error('Method not implemented.');

		// ISO padding fills the blocks up with random bytes and adds the total number of padding
		// bytes as the last pad byte, adding an extra block if the last block is complete.
		//
		// xx rr rr rr rr rr rr 07
		case PaddingMode.ISO10126:
			// TODO
			throw new Error('Method not implemented.');

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
			// TODO
			throw new Error('Method not implemented.');

		default:
			throw new Error('Unknown padding mode used.' /* LOC */);
	}
}
