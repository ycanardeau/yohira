import { MemoryStream } from '@yohira/base';
import { expect, test } from 'vitest';

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.ConstructorTests.cs#L13
test('MemoryStream_Ctor_NegativeIndices', () => {
	function MemoryStream_Ctor_NegativeIndices(
		arraySize: number,
		index: number,
		count: number,
	): void {
		expect(() =>
			MemoryStream.from(Buffer.alloc(arraySize), index, count),
		).toThrowError('must be a non-negative value.');
	}

	MemoryStream_Ctor_NegativeIndices(10, -1, Number.MAX_VALUE);
	MemoryStream_Ctor_NegativeIndices(10, 6, -1);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.ConstructorTests.cs#L21
test('MemoryStream_Ctor_OutOfRangeIndices', () => {
	function MemoryStream_Ctor_OutOfRangeIndices(
		arraySize: number,
		index: number,
		count: number,
	): void {
		expect(() =>
			MemoryStream.from(Buffer.alloc(arraySize), index, count),
		).toThrowError(
			'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.',
		);
	}

	MemoryStream_Ctor_OutOfRangeIndices(1, 2, 1);
	MemoryStream_Ctor_OutOfRangeIndices(7, 8, 2);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.ConstructorTests.cs#L27
test('MemoryStream_Ctor_NullArray', () => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	expect(() => MemoryStream.from(undefined!, 5, 2)).toThrowError(
		'Value cannot be null.',
	);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.ConstructorTests.cs#L33
test('MemoryStream_Ctor_InvalidCapacities', () => {
	// TODO: expect(() => MemoryStream.alloc(Number.MIN_VALUE)).toThrowError();
	expect(() => MemoryStream.alloc(-1)).toThrowError(
		"'capacity' must be a non-negative value.",
	);
	// TODO
});
