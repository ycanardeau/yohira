import { Guid } from 'src';
import { expect, test } from 'vitest';

const testGuid = Guid.fromString('a8a110d5-fc49-43c5-bf46-802db8f843ff');

// https://github.com/dotnet/runtime/blob/98343399e9f320b834151ed6ade21879093f2907/src/libraries/System.Runtime/tests/System/GuidTests.cs#L17
test('Empty', () => {
	expect(new Guid(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).equals(Guid.empty())).toBe(
		true,
	);
});

function* Ctor_ByteArray_TestData(): Generator<[Buffer, Guid]> {
	yield [Buffer.alloc(16), Guid.empty()];
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

function* Equals_TestData(): Generator<[Guid, Guid, boolean]> {
	yield [testGuid, testGuid, true];
	yield [
		testGuid,
		Guid.fromString('a8a110d5-fc49-43c5-bf46-802db8f843ff'),
		true,
	];
	yield [testGuid, Guid.empty(), false];

	// TODO: yield [testGuid, 'a8a110d5-fc49-43c5-bf46-802db8f843ff', false];

	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		true,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 0, 4, 5, 6, 7, 8, 9, 10, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 3, 0, 5, 6, 7, 8, 9, 10, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 3, 4, 0, 6, 7, 8, 9, 10, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 3, 4, 5, 0, 7, 8, 9, 10, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 3, 4, 5, 6, 0, 8, 9, 10, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 3, 4, 5, 6, 7, 0, 9, 10, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 0, 10, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11),
		false,
	];
	yield [
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
		new Guid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0),
		false,
	];

	// TODO
}

// https://github.com/dotnet/runtime/blob/98343399e9f320b834151ed6ade21879093f2907/src/libraries/System.Runtime/tests/System/GuidTests.cs#L360
test('EqualsTest', () => {
	function EqualsTest(guid1: Guid, guid2: Guid, expected: boolean): void {
		expect(guid1.equals(guid2)).toBe(expected);
		// TODO: expect(guid1.getHashCode() === guid2.getHashCode()).toBe(true);
	}

	for (const [guid1, guid2, expected] of Equals_TestData()) {
		EqualsTest(guid1, guid2, expected);
	}
});

// https://github.com/dotnet/runtime/blob/98343399e9f320b834151ed6ade21879093f2907/src/libraries/System.Runtime/tests/System/GuidTests.cs#L374
test('ToByteArray', () => {
	expect(
		testGuid
			.toBuffer()
			.equals(
				Buffer.from([
					0xd5, 0x10, 0xa1, 0xa8, 0x49, 0xfc, 0xc5, 0x43, 0xbf, 0x46,
					0x80, 0x2d, 0xb8, 0xf8, 0x43, 0xff,
				]),
			),
	).toBe(true);
});

function* ToString_TestData(): Generator<
	[Guid, 'N' | 'D' | 'B' | 'P' | 'X' | undefined | '', string]
> {
	yield [testGuid, 'N', 'a8a110d5fc4943c5bf46802db8f843ff'];
	yield [testGuid, 'D', 'a8a110d5-fc49-43c5-bf46-802db8f843ff'];
	yield [testGuid, 'B', '{a8a110d5-fc49-43c5-bf46-802db8f843ff}'];
	yield [testGuid, 'P', '(a8a110d5-fc49-43c5-bf46-802db8f843ff)'];
	yield [
		testGuid,
		'X',
		'{0xa8a110d5,0xfc49,0x43c5,{0xbf,0x46,0x80,0x2d,0xb8,0xf8,0x43,0xff}}',
	];

	yield [testGuid, undefined, 'a8a110d5-fc49-43c5-bf46-802db8f843ff'];
	yield [testGuid, '', 'a8a110d5-fc49-43c5-bf46-802db8f843ff'];
}

// https://github.com/dotnet/runtime/blob/98343399e9f320b834151ed6ade21879093f2907/src/libraries/System.Runtime/tests/System/GuidTests.cs#L393
test('ToStringTest', () => {
	function ToStringTest(
		guid: Guid,
		format: 'N' | 'D' | 'B' | 'P' | 'X' | undefined | '',
		expected: string,
	): void {
		if (!format || format === 'D') {
			expect(guid.toString()).toBe(expected);
			// TODO
		}
		// TODO
	}

	for (const [guid, format, expected] of ToString_TestData()) {
		ToStringTest(guid, format, expected);
	}
});

// TODO
