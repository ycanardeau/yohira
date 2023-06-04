import { using } from '@yohira/base';
import { HashAlgorithm } from '@yohira/cryptography';

import { getDigestSizeInBytes } from '../managed/HashAlgorithmExtensions';

const sizeofUint32 = 4;

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/SP800_108/ManagedSP800_108_CTR_HMACSHA512.cs,3fae90961549bc12,references
export function deriveKeys(
	kdk: Buffer,
	label: Buffer,
	context: Buffer,
	prfFactory: (kdk: Buffer) => HashAlgorithm,
	output: Buffer,
): void {
	// make copies so we can mutate these local vars
	let outputOffset = output.byteOffset;
	let outputCount = output.length;

	using(prfFactory(kdk), (prf) => {
		// See SP800-108, Sec. 5.1 for the format of the input to the PRF routine.
		const prfInput = Buffer.alloc(
			sizeofUint32 /* [i]_2 */ +
				label.length +
				1 /* 0x00 */ +
				context.length +
				sizeofUint32 /* [K]_2 */,
		);

		// Copy [L]_2 to prfInput since it's stable over all iterations
		const outputSizeInBits = outputCount * 8;
		prfInput.writeUint32BE(outputSizeInBits, prfInput.length - 4);

		// Copy label and context to prfInput since they're stable over all iterations
		label.copy(prfInput, sizeofUint32);
		context.copy(prfInput, sizeofUint32 + label.length + 1);

		const prfOutputSizeInBytes = getDigestSizeInBytes(prf);
		for (let i = 1; outputCount > 0; i++) {
			// Copy [i]_2 to prfInput since it mutates with each iteration
			prfInput.writeUint32BE(i, 0);

			// Run the PRF and copy the results to the output buffer
			const prfOutput = prf.computeHash(prfInput);
			if (prfOutputSizeInBytes !== prfOutput.length) {
				throw new Error('prfOutputSizeInBytes == prfOutput.Length');
			}
			const numBytesToCopyThisIteration = Math.min(
				prfOutputSizeInBytes,
				outputCount,
			);
			prfOutput.copy(
				output,
				outputOffset,
				0,
				numBytesToCopyThisIteration,
			);
			prfOutput.fill(0); // contains key material, so delete it

			// adjust offsets
			outputOffset += numBytesToCopyThisIteration;
			outputCount -= numBytesToCopyThisIteration;
		}
	});
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/SP800_108/ManagedSP800_108_CTR_HMACSHA512.cs,02f7570c4d8b7f54,references
export function deriveKeysWithContextHeader(
	kdk: Buffer,
	label: Buffer,
	contextHeader: Buffer,
	context: Buffer,
	prfFactory: (kdk: Buffer) => HashAlgorithm,
	output: Buffer,
): void {
	const combinedContext = Buffer.alloc(contextHeader.length + context.length);
	contextHeader.copy(combinedContext, 0);
	context.copy(combinedContext, contextHeader.length);
	deriveKeys(
		kdk,
		label,
		combinedContext /* REVIEW: ArraySegment */,
		prfFactory,
		output,
	);
}
