import { MemoryStream } from '@yohira/base';
import { expect, test } from 'vitest';

function fillWithData(buffer: Buffer): Buffer {
	for (let i = 0; i < buffer.length; i++) {
		buffer[i] = i;
	}

	return buffer;
}

function* getBuffersVariedBySize(): Generator<Buffer> {
	yield fillWithData(Buffer.alloc(0));
	yield fillWithData(Buffer.alloc(1));
	yield fillWithData(Buffer.alloc(2));
	yield fillWithData(Buffer.alloc(254));
	yield fillWithData(Buffer.alloc(255));
	yield fillWithData(Buffer.alloc(256));
	yield fillWithData(Buffer.alloc(511));
	yield fillWithData(Buffer.alloc(512));
	yield fillWithData(Buffer.alloc(513));
	yield fillWithData(Buffer.alloc(1023));
	yield fillWithData(Buffer.alloc(1024));
	yield fillWithData(Buffer.alloc(1025));
	yield fillWithData(Buffer.alloc(2047));
	yield fillWithData(Buffer.alloc(2048));
	yield fillWithData(Buffer.alloc(2049));
}

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L14
test('TryGetBuffer_Constructor_AlwaysReturnsTrue', () => {
	const stream = MemoryStream.alloc();
	expect(stream.capacity).toBe(0);

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(true);
	const segment = tryGetBufferResult.val;

	expect(segment.buffer).not.toBeUndefined();
	expect(segment.byteOffset).toBe(0);
	expect(segment.length).toBe(0);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L28
test('TryGetBuffer_Constructor_Int32_AlwaysReturnsTrue', () => {
	const stream = MemoryStream.alloc(512);
	expect(stream.capacity).toBe(512);

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(true);
	const segment = tryGetBufferResult.val;

	expect(segment.buffer.byteLength).toBe(512);
	expect(segment.byteOffset).toBe(0);
	expect(segment.length).toBe(0);
});

// TODO

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L62
test('TryGetBuffer_Constructor_ByteArray_Int32_Int32_AlwaysReturnsFalse', () => {
	const stream = MemoryStream.from(Buffer.alloc(512), 0, 512);
	expect(stream.capacity).toBe(512);

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(false);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L72
test('TryGetBuffer_Constructor_ByteArray_Int32_Int32_Bool_AlwaysReturnsFalse', () => {
	const stream = MemoryStream.from(Buffer.alloc(512), 0, 512, true);
	expect(stream.capacity).toBe(512);

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(false);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L82
test('TryGetBuffer_Constructor_ByteArray_Int32_Int32_Bool_Bool_FalseAsPubliclyVisible_ReturnsFalse', () => {
	const stream = MemoryStream.from(Buffer.alloc(512), 0, 512, true, false);
	expect(stream.capacity).toBe(512);

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(false);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L92
test('TryGetBuffer_Constructor_ByteArray_Int32_Int32_Bool_Bool_TrueAsPubliclyVisible_ReturnsTrue', () => {
	const stream = MemoryStream.from(Buffer.alloc(512), 0, 512, true, true);
	expect(stream.capacity).toBe(512);

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(true);
	const segment = tryGetBufferResult.val;

	expect(segment.buffer).not.toBeUndefined();
	expect(segment.buffer.byteLength).toBe(512);
	expect(segment.byteOffset).toBe(0);
	expect(segment.length).toBe(512);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L108
test('TryGetBuffer_Constructor_ByteArray_AlwaysReturnsEmptyArraySegment', () => {
	function TryGetBuffer_Constructor_ByteArray_AlwaysReturnsEmptyArraySegment(
		buffer: Buffer,
	): void {
		const stream = MemoryStream.from(buffer, 0, buffer.length);

		const tryGetBufferResult = stream.tryGetBuffer();
		expect(tryGetBufferResult.ok).toBe(false);
		const result = tryGetBufferResult.val;

		// publiclyVisible = false;
		expect(result.equals(Buffer.alloc(0) /* TODO */)).toBe(true);
	}

	for (const buffer of getBuffersVariedBySize()) {
		TryGetBuffer_Constructor_ByteArray_AlwaysReturnsEmptyArraySegment(
			buffer,
		);
	}
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L121
test('TryGetBuffer_Constructor_ByteArray_Bool_AlwaysReturnsEmptyArraySegment', () => {
	function TryGetBuffer_Constructor_ByteArray_Bool_AlwaysReturnsEmptyArraySegment(
		buffer: Buffer,
	): void {
		const stream = MemoryStream.from(buffer, 0, buffer.length, true);

		const tryGetBufferResult = stream.tryGetBuffer();
		expect(tryGetBufferResult.ok).toBe(false);
		const result = tryGetBufferResult.val;

		expect(result.equals(Buffer.alloc(0) /* TODO */)).toBe(true);
	}

	for (const buffer of getBuffersVariedBySize()) {
		TryGetBuffer_Constructor_ByteArray_Bool_AlwaysReturnsEmptyArraySegment(
			buffer,
		);
	}
});

// TODO

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L172
test('TryGetBuffer_Constructor_AlwaysReturnsOffsetSetToZero', () => {
	const stream = MemoryStream.alloc();

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(true);
	const result = tryGetBufferResult.val;

	expect(result.byteOffset).toBe(0);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L184
test('TryGetBuffer_Constructor_Int32_AlwaysReturnsOffsetSetToZero', () => {
	const stream = MemoryStream.alloc(512);

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(true);
	const result = tryGetBufferResult.val;

	expect(result.byteOffset).toBe(0);
});

// TODO

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L207
test('TryGetBuffer_Constructor_ByDefaultReturnsCountSetToZero', () => {
	const stream = MemoryStream.alloc(0);

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(true);
	const result = tryGetBufferResult.val;

	expect(result.length).toBe(0);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L219
test('TryGetBuffer_Constructor_ReturnsCountSetToWrittenLength', () => {
	function TryGetBuffer_Constructor_ReturnsCountSetToWrittenLength(
		buffer: Buffer,
	): void {
		const stream = MemoryStream.alloc();
		stream.write(buffer, 0, buffer.length);

		const tryGetBufferResult = stream.tryGetBuffer();
		expect(tryGetBufferResult.ok).toBe(true);
		const result = tryGetBufferResult.val;

		expect(result.length).toBe(buffer.length);
	}

	for (const buffer of getBuffersVariedBySize()) {
		TryGetBuffer_Constructor_ReturnsCountSetToWrittenLength(buffer);
	}
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L231
test('TryGetBuffer_Constructor_Int32_ByDefaultReturnsCountSetToZero', () => {
	const stream = MemoryStream.alloc(512);

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(true);
	const result = tryGetBufferResult.val;

	expect(result.byteOffset).toBe(0);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L243
test('TryGetBuffer_Constructor_Int32_ReturnsCountSetToWrittenLength', () => {
	function TryGetBuffer_Constructor_Int32_ReturnsCountSetToWrittenLength(
		buffer: Buffer,
	): void {
		const stream = MemoryStream.alloc(512);
		stream.write(buffer, 0, buffer.length);

		const tryGetBufferResult = stream.tryGetBuffer();
		expect(tryGetBufferResult.ok).toBe(true);
		const result = tryGetBufferResult.val;

		expect(result.length).toBe(buffer.length);
	}

	for (const buffer of getBuffersVariedBySize()) {
		TryGetBuffer_Constructor_Int32_ReturnsCountSetToWrittenLength(buffer);
	}
});

// TODO

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L267
test('TryGetBuffer_Constructor_ReturnsArray', () => {
	const stream = MemoryStream.alloc();

	const tryGetBufferResult = stream.tryGetBuffer();
	expect(tryGetBufferResult.ok).toBe(true);
	const result = tryGetBufferResult.val;

	expect(result.buffer).not.toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L278
test('TryGetBuffer_Constructor_MultipleCallsReturnsSameArray', () => {
	const stream = MemoryStream.alloc();

	const tryGetBufferResult1 = stream.tryGetBuffer();
	expect(tryGetBufferResult1.ok).toBe(true);
	const result1 = tryGetBufferResult1.val;

	const tryGetBufferResult2 = stream.tryGetBuffer();
	expect(tryGetBufferResult2.ok).toBe(true);
	const result2 = tryGetBufferResult2.val;

	expect(result2.buffer).toBe(result1.buffer);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L291
test('TryGetBuffer_Constructor_Int32_MultipleCallsReturnSameArray', () => {
	const stream = MemoryStream.alloc(512);

	const tryGetBufferResult1 = stream.tryGetBuffer();
	expect(tryGetBufferResult1.ok).toBe(true);
	const result1 = tryGetBufferResult1.val;

	const tryGetBufferResult2 = stream.tryGetBuffer();
	expect(tryGetBufferResult2.ok).toBe(true);
	const result2 = tryGetBufferResult2.val;

	expect(result2.buffer).toBe(result1.buffer);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.TryGetBufferTests.cs#L304
test('TryGetBuffer_Constructor_Int32_WhenWritingPastCapacity_ReturnsDifferentArrays', () => {
	const stream = MemoryStream.alloc(512);

	const tryGetBufferResult1 = stream.tryGetBuffer();
	expect(tryGetBufferResult1.ok).toBe(true);
	const result1 = tryGetBufferResult1.val;

	// Force the stream to resize the underlying array
	stream.write(Buffer.alloc(1024), 0, 1024);

	const tryGetBufferResult2 = stream.tryGetBuffer();
	expect(tryGetBufferResult2.ok).toBe(true);
	const result2 = tryGetBufferResult2.val;

	expect(result2.buffer).not.toBe(result1.buffer);
});

// TODO
