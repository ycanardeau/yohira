// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/ICryptoTransform.cs,1580d78b8a5ac0c8,references
export interface ICryptoTransform extends Disposable {
	readonly inputBlockSize: number;
	readonly outputBlockSize: number;
	/**
	 * canTransformMultipleBlocks === true implies that transformBlock() can accept any number
	 * of whole blocks, not just a single block.  If canTransformMultipleBlocks is false, you have
	 * to feed blocks one at a time.
	 */
	readonly canTransformMultipleBlocks: boolean;

	// The return value of transformBlock is the number of bytes returned to outputBuffer and is
	// always <= outputBlockSize.  If canTransformMultipleBlocks is true, then inputCount may be
	// any positive multiple of inputBlockSize
	transformBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
		outputBuffer: Buffer,
		outputOffset: number,
	): number;

	// Special function for transforming the last block or partial block in the stream.  The
	// return value is an array containing the remaining transformed bytes.
	// We return a new array here because the amount of information we send back at the end could
	// be larger than a single block once padding is accounted for.
	transformFinalBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
	): Buffer;
}
