import { MemoryStream } from '@yohira/base';
import { randomBytes } from 'node:crypto';
import { expect, test } from 'vitest';

function* getBuffersVariedBySize(): Generator<Buffer> {
	yield randomBytes(0);
	yield randomBytes(1);
	yield randomBytes(2);
	yield randomBytes(256);
	yield randomBytes(512);
	yield randomBytes(1024);
	yield randomBytes(2047);
	yield randomBytes(2048);
	yield randomBytes(2049);
	yield randomBytes(2100);
}

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.ToArrayTests.cs#L16
test('ToArray_ZeroOffset', () => {
	function ToArray_ZeroOffset(buffer: Buffer): void {
		const stream = MemoryStream.alloc();
		stream.write(buffer, 0, buffer.length);
		const newBuffer = stream.toBuffer();

		expect(newBuffer.length).toBe(buffer.length);
		expect(newBuffer.equals(buffer)).toBe(true);
	}

	for (const buffer of getBuffersVariedBySize()) {
		ToArray_ZeroOffset(buffer);
	}
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStream.ToArrayTests.cs#L28
test('ToArray_Offset', () => {
	function ToArray_Offset(buffer: Buffer): void {
		let index = 0;
		let count = buffer.length;

		if (count > 3) {
			// Trim some off each end
			index = 1;
			count -= 3;
		}

		const stream = MemoryStream.from(buffer, index, count);
		const newBuffer = stream.toBuffer();

		expect(newBuffer.length).toBe(count);
		expect(newBuffer.equals(buffer.subarray(index, index + count))).toBe(
			true,
		);
	}

	for (const buffer of getBuffersVariedBySize()) {
		ToArray_Offset(buffer);
	}
});
