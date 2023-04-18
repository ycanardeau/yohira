import { using } from '@yohira/base';
import { ICryptoTransform, SymmetricAlgorithm } from '@yohira/cryptography';

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/Common/tests/System/Security/Cryptography/CryptoUtils.cs#L29
function transform(
	transform: ICryptoTransform,
	input: Buffer,
	blockSizeMultiplier = 1,
): Buffer {
	const output: Buffer[] = []; /* TODO: input.length */
	const blockSize = transform.inputBlockSize * blockSizeMultiplier;
	for (let i = 0; i <= input.length; i += blockSize) {
		const count = Math.min(blockSize, input.length - i);
		if (count >= blockSize) {
			const buffer = Buffer.alloc(blockSize);
			const numBytesWritten = transform.transformBlock(
				input,
				i,
				count,
				buffer,
				0,
			);
			// REVIEW: Array.resize
			if (buffer.length <= numBytesWritten) {
				output.push(buffer.subarray(0, numBytesWritten));
			} else {
				output.push(buffer);
				output.push(Buffer.alloc(numBytesWritten - buffer.length));
			}
		} else {
			const finalBlock = transform.transformFinalBlock(input, i, count);
			output.push(finalBlock);
			break;
		}
	}

	return Buffer.concat(output);
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/Common/tests/System/Security/Cryptography/CryptoUtils.cs#L13
export function encrypt(
	alg: SymmetricAlgorithm,
	plainText: Buffer,
	blockSizeMultiplier = 1,
): Buffer {
	return using(alg.createEncryptor(), (encryptor) => {
		return transform(encryptor, plainText, blockSizeMultiplier);
	});
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/Common/tests/System/Security/Cryptography/CryptoUtils.cs#L21
export function decrypt(
	alg: SymmetricAlgorithm,
	cipher: Buffer,
	blockSizeMultiplier = 1,
): Buffer {
	return using(alg.createDecryptor(), (decryptor) => {
		return transform(decryptor, cipher, blockSizeMultiplier);
	});
}
