import { Guid } from '@yohira/base';
import { expect, test } from 'vitest';

const testGuid = Guid.fromString('a8a110d5-fc49-43c5-bf46-802db8f843ff');

// https://github.com/dotnet/runtime/blob/98343399e9f320b834151ed6ade21879093f2907/src/libraries/System.Runtime/tests/System/GuidTests.cs#L17
test('Empty', () => {
	expect(new Guid(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).equals(Guid.empty)).toBe(
		true,
	);
});

function* Ctor_ByteArray_TestData(): Generator<[Buffer, Guid]> {
	yield [Buffer.alloc(16), Guid.empty];
	yield [
		Buffer.from([
			0x44, 0x33, 0x22, 0x11, 0x66, 0x55, 0x88, 0x77, 0x99, 0x00, 0xaa,
			0xbb, 0xcc, 0xdd, 0xee, 0xff,
		]),
		Guid.fromString('11223344-5566-7788-9900-aabbccddeeff'),
	];
	yield [
		Buffer.from([
			0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0x00, 0xaa,
			0xbb, 0xcc, 0xdd, 0xee, 0xff,
		]),
		Guid.fromString('44332211-6655-8877-9900-aabbccddeeff'),
	];
	yield [testGuid.toBuffer(), testGuid];
}

// https://github.com/dotnet/runtime/blob/98343399e9f320b834151ed6ade21879093f2907/src/libraries/System.Runtime/tests/System/GuidTests.cs#L32
test('Ctor_ByteArray', () => {
	function Ctor_ByteArray(b: Buffer, expected: Guid): void {
		expect(Guid.fromBuffer(b).equals(expected)).toBe(true);
	}

	for (const [b, expected] of Ctor_ByteArray_TestData()) {
		Ctor_ByteArray(b, expected);
	}
});

// TODO
