import { HashAlgorithm } from '@yohira/cryptography';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Managed/HashAlgorithmExtensions.cs,46b88d8174f3593e,references
export function getDigestSizeInBytes(hashAlgorithm: HashAlgorithm): number {
	const hashSizeInBits = hashAlgorithm.hashSize;
	if (hashSizeInBits < 0 || hashSizeInBits % 8 !== 0) {
		throw new Error('hashSizeInBits >= 0 && hashSizeInBits % 8 == 0');
	}
	return hashSizeInBits / 8;
}
