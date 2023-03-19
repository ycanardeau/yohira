import { MemoryStream } from '@yohira/base';
import { expect, test } from 'vitest';

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.GetBufferTests.cs#L11
test('MemoryStream_GetBuffer_Length', () => {
	const ms = MemoryStream.alloc();
	const buffer = ms.getBuffer();
	expect(buffer.length).toBe(0);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.GetBufferTests.cs#L19
test('MemoryStream_GetBuffer_NonExposable', () => {
	const ms = MemoryStream.from(Buffer.alloc(100), 0, 100);
	expect(() => ms.getBuffer()).toThrowError();
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.GetBufferTests.cs#L26
test('MemoryStream_GetBuffer_Exposable', () => {
	const ms = MemoryStream.from(Buffer.allocUnsafe(500), 0, 100, true, true);
	const buffer = ms.getBuffer();
	expect(buffer.length).toBe(500);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.GetBufferTests.cs#L34
test('MemoryStream_GetBuffer_AfterCapacityReset', () => {
	const ms = MemoryStream.alloc(100);
	ms.capacity = 0;
	expect(ms.getBuffer()).not.toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.GetBufferTests.cs#L42
test('MemoryStream_GetBuffer', () => {
	const testdata = Buffer.alloc(100);
	// TODO: nextBytes
	const ms = MemoryStream.alloc(100);
	let buffer = ms.getBuffer();
	expect(buffer.length).toBe(100);

	ms.write(testdata, 0, 100);
	ms.write(testdata, 0, 100);
	expect(ms.length).toBe(200);
	buffer = ms.getBuffer();
	expect(buffer.length).toBe(256); // Minimum size after writing
});
