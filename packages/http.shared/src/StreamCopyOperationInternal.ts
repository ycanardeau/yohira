import { Stream } from '@yohira/base';
import { Writable } from 'node:stream';

const defaultBufferSize = 4096;

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/src/Http/Shared/StreamCopyOperationInternal.cs,43a14722ac80264f,references
export async function copyTo(
	source: Stream,
	destination: Writable,
	count: number | undefined,
	bufferSize = defaultBufferSize,
): Promise<void> {
	let bytesRemaining = count;

	const buffer = Buffer.alloc(bufferSize); /* TODO: rent */
	try {
		if (source === undefined) {
			throw new Error('Assertion failed.');
		}
		if (destination === undefined) {
			throw new Error('Assertion failed.');
		}
		if (bytesRemaining !== undefined && bytesRemaining >= 0) {
			throw new Error('Assertion failed.');
		}
		if (buffer === undefined) {
			throw new Error('Assertion failed.');
		}

		while (true) {
			// The natural end of the range.
			if (bytesRemaining !== undefined && bytesRemaining <= 0) {
				return;
			}

			// TODO: cancel

			let readLength = buffer.length;
			if (bytesRemaining !== undefined) {
				readLength = Math.min(bytesRemaining, readLength);
			}
			const read = source.read(
				buffer.subarray(0, readLength),
				0,
				readLength,
			);

			if (bytesRemaining !== undefined) {
				bytesRemaining -= read;
			}

			// End of the source stream.
			if (read === 0) {
				return;
			}

			// TODO: cancel

			// REVIEW
			await new Promise<void>((resolve, reject) => {
				destination.write(buffer.subarray(0, read), (error) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				});
			});
		}
	} finally {
		// TODO: return
	}
}
