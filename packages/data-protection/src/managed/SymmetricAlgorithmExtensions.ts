import { SymmetricAlgorithm } from '@yohira/cryptography';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Managed/SymmetricAlgorithmExtensions.cs,0463cb861ec0bc92,references
export function getBlockSizeInBytes(
	symmetricAlgorithm: SymmetricAlgorithm,
): number {
	const blockSizeInBits = symmetricAlgorithm.blockSize;
	if (blockSizeInBits < 0 || blockSizeInBits % 8 !== 0) {
		throw new Error('blockSizeInBits >= 0 && blockSizeInBits % 8 == 0"');
	}
	return blockSizeInBits / 8;
}
