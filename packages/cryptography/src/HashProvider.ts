// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/HashProvider.cs,4c10c84edd3e12aa,references
export abstract class HashProvider implements Disposable {
	// Returns the length of the byte array returned by FinalizeHashAndReset.
	abstract get hashSizeInBytes(): number;

	abstract appendHashDataCore(data: Buffer): void;

	// Adds new data to be hashed. This can be called repeatedly in order to hash data from noncontiguous sources.
	appendHashData(data: Buffer, offset: number, count: number): void {
		if (offset < 0) {
			throw new Error(
				`offset ('${offset}') must be a non-negative value.` /* LOC */,
			);
		}
		if (count < 0) {
			throw new Error(
				`count ('${count}') must be a non-negative value.` /* LOC */,
			);
		}
		if (data.length - offset < count) {
			throw new Error(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.' /* LOC */,
			);
		}

		this.appendHashDataCore(data.subarray(offset, offset + count));
	}

	// Compute the hash based on the appended data and resets the HashProvider for more hashing.
	abstract finalizeHashAndResetCore(destination: Buffer): number;

	finalizeHashAndReset(): Buffer {
		const ret = Buffer.alloc(this.hashSizeInBytes);

		const written = this.finalizeHashAndResetCore(ret);
		if (written !== this.hashSizeInBytes) {
			throw new Error('Assertion failed.');
		}

		return ret;
	}

	// Releases any native resources and keys used by the HashProvider.
	abstract [Symbol.dispose](): void;

	abstract reset(): void;
}
