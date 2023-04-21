import { using } from '@yohira/base';
import { HMAC, HashAlgorithm } from '@yohira/cryptography';
import { Result } from '@yohira/third-party.ts-results';
import { expect, test } from 'vitest';

// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L12
export abstract class HmacTests {
	protected constructor(
		readonly testKeys: Buffer[],
		readonly testData: Buffer[],
		readonly testMacs: Buffer[],
	) {}

	protected abstract get blockSize(): number;
	protected abstract get macSize(): number;

	protected abstract create(): HMAC;

	protected abstract createHashAlgorithm(): HashAlgorithm;
	protected abstract hashDataOneShot(key: Buffer, source: Buffer): Buffer;
	protected abstract hashDataOneShot(
		key: Buffer,
		source: Buffer,
		destination: Buffer,
	): number;
	protected abstract hashDataOneShot(
		key: Buffer,
		source: Buffer,
		destination?: Buffer,
	): number | Buffer;

	protected abstract tryHashDataOneShot(
		key: Buffer,
		source: Buffer,
		destination: Buffer,
	): Result<number, number>;

	protected verifyHmac(testCaseId: number, digestBytes: Buffer): void {
		function truncate(digest: Buffer, truncateSize: number): Buffer {
			if (truncateSize === -1) {
				return digest;
			}

			return digest.subarray(0, truncateSize);
		}

		const data = this.testData[testCaseId];
		let computedDigest: Buffer = undefined!;
		const truncateSize = digestBytes.length;
		expect(truncateSize).toBeLessThanOrEqual(this.macSize);

		using(this.create(), (hmac) => {
			expect(hmac.hashSize / 8).toBe(this.macSize);

			const key = Buffer.from(this.testKeys[testCaseId]);
			hmac.key = key;

			// make sure the getter returns different objects each time
			expect(hmac.key === key).toBe(false);
			expect(hmac.key === hmac.key).toBe(false);

			// make sure the setter didn't cache the exact object we passed in
			key[0] = key[0] + 1;
			expect(hmac.key).not.toBe(key);

			computedDigest = hmac.computeHash(data);
		});

		computedDigest = truncate(computedDigest, truncateSize);
		expect(computedDigest.equals(digestBytes)).toBe(true);

		using(this.create(), (hmac) => {
			const key = Buffer.from(this.testKeys[testCaseId]);
			hmac.key = key;

			hmac.transformBlock(data, 0, data.length, undefined!, 0);
			hmac.initialize();
			hmac.transformBlock(data, 0, data.length, undefined!, 0);
			hmac.transformFinalBlock(Buffer.alloc(0), 0, 0);
			computedDigest = hmac.hash!;
		});

		computedDigest = truncate(computedDigest, truncateSize);
		expect(computedDigest.equals(digestBytes)).toBe(true);

		// One shot - allocating and byte array inputs
		computedDigest = this.hashDataOneShot(this.testKeys[testCaseId], data);

		computedDigest = truncate(computedDigest, truncateSize);
		expect(computedDigest.equals(digestBytes)).toBe(true);
	}

	protected verifyHmacRfc2104_2(): void {
		// Ensure that keys shorter than the threshold don't get altered.
		using(this.create(), (hmac) => {
			const key = Buffer.alloc(this.blockSize);
			hmac.key = key;
			const retrievedKey = hmac.key;
			expect(retrievedKey.equals(key)).toBe(true);
		});

		// Ensure that keys longer than the threshold are adjusted via Rfc2104 Section 2.
		using(this.create(), (hmac) => {
			const overSizedKey = Buffer.alloc(this.blockSize + 1);
			hmac.key = overSizedKey;
			const actualKey = hmac.key;
			let expectedKey: Buffer = undefined!;
			using(this.createHashAlgorithm(), (hash) => {
				expectedKey = hash.computeHash(overSizedKey);
			});
			expect(actualKey.equals(expectedKey)).toBe(true);

			// Also ensure that the hashing operation uses the adjusted key.
			const data = Buffer.alloc(100);
			hmac.key = expectedKey;
			const expectedHash = hmac.computeHash(data);

			hmac.key = overSizedKey;
			const actualHash = hmac.computeHash(data);
			expect(actualHash.equals(expectedHash)).toBe(true);
		});
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L258
	InvalidInput_Null(): void {
		using(this.create(), (hash) => {
			expect(() => hash.computeHash(undefined!)).toThrowError(
				'Value cannot be null.',
			);
			expect(() => hash.computeHash(undefined!, 0, 0)).toThrowError(
				'Value cannot be null.',
			);
		});
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L269
	InvalidInput_NegativeOffset(): void {
		using(this.create(), (hash) => {
			expect(() => hash.computeHash(Buffer.alloc(0), -1, 0)).toThrowError(
				"offset ('-1') must be a non-negative value.",
			);
		});
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L278
	InvalidInput_NegativeCount(): void {
		using(this.create(), (hash) => {
			expect(() => hash.computeHash(Buffer.alloc(0), 0, -1)).toThrowError(
				'Value was invalid.',
			);
		});
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L287
	InvalidInput_TooBigOffset(): void {
		using(this.create(), (hash) => {
			expect(() => hash.computeHash(Buffer.alloc(0), 1, 0)).toThrowError(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.',
			);
		});
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L296
	InvalidInput_TooBigCount(): void {
		const nonEmpty = Buffer.alloc(53);

		using(this.create(), (hash) => {
			expect(() =>
				hash.computeHash(nonEmpty, 0, nonEmpty.length + 1),
			).toThrowError('Value was invalid.');
			expect(() =>
				hash.computeHash(nonEmpty, 1, nonEmpty.length),
			).toThrowError(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.',
			);
			expect(() =>
				hash.computeHash(nonEmpty, 2, nonEmpty.length - 1),
			).toThrowError(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.',
			);
			expect(() => hash.computeHash(Buffer.alloc(0), 0, 1)).toThrowError(
				'Value was invalid.',
			);
		});
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L310
	BoundaryCondition_Count0(): void {
		const nonEmpty = Buffer.alloc(53);

		using(this.create(), (hash) => {
			const emptyHash = hash.computeHash(Buffer.alloc(0));
			let shouldBeEmptyHash = hash.computeHash(
				nonEmpty,
				nonEmpty.length,
				0,
			);

			expect(shouldBeEmptyHash.equals(emptyHash)).toBe(true);

			shouldBeEmptyHash = hash.computeHash(nonEmpty, 0, 0);
			expect(shouldBeEmptyHash.equals(emptyHash)).toBe(true);

			nonEmpty[0] = 0xff;
			nonEmpty[nonEmpty.length - 1] = 0x77;

			shouldBeEmptyHash = hash.computeHash(nonEmpty, nonEmpty.length, 0);
			expect(shouldBeEmptyHash.equals(emptyHash)).toBe(true);

			shouldBeEmptyHash = hash.computeHash(nonEmpty, 0, 0);
			expect(shouldBeEmptyHash.equals(emptyHash)).toBe(true);
		});
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L336
	OffsetAndCountRespected(): void {
		const dataA = Buffer.from([1, 1, 2, 3, 5, 8]);
		const dataB = Buffer.from([0, 1, 1, 2, 3, 5, 8, 13]);

		using(this.create(), (hash) => {
			const baseline = hash.computeHash(dataA);

			// Skip the 0 byte, and stop short of the 13.
			const offsetData = hash.computeHash(dataB, 1, dataA.length);

			expect(offsetData.equals(baseline)).toBe(true);
		});
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L353
	InvalidKey_ThrowArgumentNullException(): void {
		using(this.create(), (hash) => {
			expect(() => (hash.key = undefined!)).toThrowError(
				'Value cannot be undefined.',
			);
		});
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L362
	OneShot_NullKey_ArgumentNullException(): void {
		expect(() =>
			this.hashDataOneShot(undefined!, Buffer.from([])),
		).toThrowError('Value cannot be undefined.');
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L369
	OneShot_NullSource_ArgumentNullException(): void {
		expect(() =>
			this.hashDataOneShot(Buffer.alloc(0), undefined!),
		).toThrowError('Value cannot be undefined.');
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L376
	OneShot_ExistingBuffer_TooSmall(): void {
		const buffer = Buffer.alloc(this.macSize - 1);
		const key = this.testKeys[1];
		const data = this.testData[1];

		expect(() => this.hashDataOneShot(key, data, buffer)).toThrowError(
			'Destination is too short.',
		);

		expect(buffer.equals(Buffer.alloc(buffer.length).fill(0))).toBe(true);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L389
	OneShot_TryExistingBuffer_TooSmall(): void {
		const buffer = Buffer.alloc(this.macSize - 1);
		const key = this.testKeys[1];
		const data = this.testData[1];

		const tryHashDataOneShotResult = this.tryHashDataOneShot(
			key,
			data,
			buffer,
		);
		const written = tryHashDataOneShotResult.val;
		expect(tryHashDataOneShotResult.ok).toBe(false);
		expect(written).toBe(0);
		expect(buffer.equals(Buffer.alloc(buffer.length).fill(0))).toBe(true);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L401
	OneShot_TryExistingBuffer_Exact(): void {
		for (let caseId = 1; caseId <= 7; caseId++) {
			const buffer = Buffer.alloc(this.macSize);
			const key = this.testKeys[caseId];
			const data = this.testData[caseId];

			const tryHashDataOneShotResult = this.tryHashDataOneShot(
				key,
				data,
				buffer,
			);
			const written = tryHashDataOneShotResult.val;
			expect(tryHashDataOneShotResult.ok).toBe(true);
			expect(written).toBe(this.macSize);

			const expectedMac = this.testMacs[caseId];
			const truncatedBuffer = buffer.subarray(0, expectedMac.length);
			expect(truncatedBuffer.equals(expectedMac)).toBe(true);
		}
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L419
	OneShot_TryExistingBuffer_Larger(): void {
		for (let caseId = 1; caseId <= 7; caseId++) {
			const buffer = Buffer.alloc(this.macSize + 20);
			const key = this.testKeys[caseId];
			const data = this.testData[caseId];

			buffer.fill(0xcc);
			const writeBuffer = buffer.subarray(10, 10 + this.macSize);

			const tryHashDataOneShotResult = this.tryHashDataOneShot(
				key,
				data,
				writeBuffer,
			);
			const written = tryHashDataOneShotResult.val;
			expect(tryHashDataOneShotResult.ok).toBe(true);
			expect(written).toBe(this.macSize);

			const expectedMac = this.testMacs[caseId];
			const truncatedWriteBuffer = writeBuffer.subarray(
				0,
				expectedMac.length,
			);
			expect(truncatedWriteBuffer.equals(expectedMac)).toBe(true);
			expect(
				buffer.subarray(0, 10).equals(Buffer.alloc(10).fill(0xcc)),
			).toBe(true);
			expect(
				buffer
					.subarray(buffer.length - 10)
					.equals(Buffer.alloc(10).fill(0xcc)),
			).toBe(true);
		}
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L446
	OneShot_TryExistingBuffer_OverlapsKey(): void {
		const OneShot_TryExistingBuffer_OverlapsKey = (
			keyOffset: number,
			bufferOffset: number,
		): void => {
			for (let caseId = 1; caseId <= 7; caseId++) {
				const key = this.testKeys[caseId];
				const data = this.testData[caseId];
				const buffer = Buffer.alloc(
					Math.max(key.length, this.macSize) +
						Math.max(keyOffset, bufferOffset),
				);

				const writeBuffer = buffer.subarray(
					bufferOffset,
					bufferOffset + this.macSize,
				);
				const keyBuffer = buffer.subarray(
					keyOffset,
					keyOffset + key.length,
				);
				key.copy(keyBuffer);

				const tryHashDataOneShotResult = this.tryHashDataOneShot(
					keyBuffer,
					data,
					writeBuffer,
				);
				const written = tryHashDataOneShotResult.val;
				expect(tryHashDataOneShotResult.ok).toBe(true);
				expect(written).toBe(this.macSize);

				const expectedMac = this.testMacs[caseId];
				const truncatedWriteBuffer = writeBuffer.subarray(
					0,
					expectedMac.length,
				);
				expect(truncatedWriteBuffer.equals(expectedMac)).toBe(true);
			}
		};

		OneShot_TryExistingBuffer_OverlapsKey(0, 10);
		OneShot_TryExistingBuffer_OverlapsKey(10, 10);
		OneShot_TryExistingBuffer_OverlapsKey(10, 0);
		OneShot_TryExistingBuffer_OverlapsKey(10, 20);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L472
	OneShot_TryExistingBuffer_OverlapsSource(): void {
		const OneShot_TryExistingBuffer_OverlapsSource = (
			sourceOffset: number,
			bufferOffset: number,
		): void => {
			for (let caseId = 1; caseId <= 7; caseId++) {
				const key = this.testKeys[caseId];
				const data = this.testData[caseId];
				const buffer = Buffer.alloc(
					Math.max(data.length, this.macSize) +
						Math.max(sourceOffset, bufferOffset),
				);

				const writeBuffer = buffer.subarray(
					bufferOffset,
					bufferOffset + this.macSize,
				);
				const dataBuffer = buffer.subarray(
					sourceOffset,
					sourceOffset + data.length,
				);
				data.copy(dataBuffer);

				const tryHashDataOneShotResult = this.tryHashDataOneShot(
					key,
					dataBuffer,
					writeBuffer,
				);
				const written = tryHashDataOneShotResult.val;
				expect(tryHashDataOneShotResult.ok).toBe(true);
				expect(written).toBe(this.macSize);

				const expectedMac = this.testMacs[caseId];
				const truncatedWriteBuffer = writeBuffer.subarray(
					0,
					expectedMac.length,
				);
				expect(truncatedWriteBuffer.equals(expectedMac)).toBe(true);
			}
		};

		OneShot_TryExistingBuffer_OverlapsSource(0, 10);
		OneShot_TryExistingBuffer_OverlapsSource(10, 10);
		OneShot_TryExistingBuffer_OverlapsSource(10, 0);
		OneShot_TryExistingBuffer_OverlapsSource(10, 20);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacTests.cs#L496
	OneShot_Empty_Matches_Instances(): void {
		const OneShot_Empty_Matches_Instances = (
			key: Buffer,
			source: Buffer,
		): void => {
			using(this.create(), (hash) => {
				hash.key = key;
				const mac = hash.computeHash(source, 0, source.length);

				const oneShot = this.hashDataOneShot(key, source);
				expect(oneShot.equals(mac)).toBe(true);
			});
		};

		OneShot_Empty_Matches_Instances(Buffer.alloc(0), Buffer.from([1]));
		OneShot_Empty_Matches_Instances(Buffer.from([1]), Buffer.alloc(0));
	}

	// TODO
}

export function testHmac(hmacTests: HmacTests): void {
	test('InvalidInput_Null', () => {
		hmacTests.InvalidInput_Null();
	});

	test('InvalidInput_NegativeOffset', () => {
		hmacTests.InvalidInput_NegativeOffset();
	});

	test('InvalidInput_NegativeCount', () => {
		hmacTests.InvalidInput_NegativeCount();
	});

	test('InvalidInput_TooBigOffset', () => {
		hmacTests.InvalidInput_TooBigOffset();
	});

	test('InvalidInput_TooBigCount', () => {
		hmacTests.InvalidInput_TooBigCount();
	});

	test('BoundaryCondition_Count0', () => {
		hmacTests.BoundaryCondition_Count0();
	});

	test('OffsetAndCountRespected', () => {
		hmacTests.OffsetAndCountRespected();
	});

	test('InvalidKey_ThrowArgumentNullException', () => {
		hmacTests.InvalidKey_ThrowArgumentNullException();
	});

	test('OneShot_NullKey_ArgumentNullException', () => {
		hmacTests.OneShot_NullKey_ArgumentNullException();
	});

	test('OneShot_NullSource_ArgumentNullException', () => {
		hmacTests.OneShot_NullSource_ArgumentNullException();
	});

	test('OneShot_ExistingBuffer_TooSmall', () => {
		hmacTests.OneShot_ExistingBuffer_TooSmall();
	});

	test('OneShot_TryExistingBuffer_TooSmall', () => {
		hmacTests.OneShot_TryExistingBuffer_TooSmall();
	});

	test('OneShot_TryExistingBuffer_Exact', () => {
		hmacTests.OneShot_TryExistingBuffer_Exact();
	});

	test('OneShot_TryExistingBuffer_Larger', () => {
		hmacTests.OneShot_TryExistingBuffer_Larger();
	});

	test('OneShot_TryExistingBuffer_OverlapsKey', () => {
		hmacTests.OneShot_TryExistingBuffer_OverlapsKey();
	});

	test('OneShot_TryExistingBuffer_OverlapsSource', () => {
		hmacTests.OneShot_TryExistingBuffer_OverlapsSource();
	});

	test('OneShot_Empty_Matches_Instances', () => {
		hmacTests.OneShot_Empty_Matches_Instances();
	});

	// TODO
}
