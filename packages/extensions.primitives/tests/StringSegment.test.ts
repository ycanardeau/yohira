import { StringSegment } from '@yohira/extensions.primitives';
import { expect, test } from 'vitest';

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L12
test('StringSegment_Empty', () => {
	const segment = StringSegment.empty;

	expect(segment.hasValue).toBe(true);
	expect(segment.value).toBe('');
	expect(segment.offset).toBe(0);
	expect(segment.length).toBe(0);
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L25
test('StringSegment_ImplicitConvertFromString', () => {
	const segment = StringSegment.from('Hello');

	expect(segment.hasValue).toBe(true);
	expect(segment.offset).toBe(0);
	expect(segment.length).toBe(5);
	expect(segment.value).toBe('Hello');
});

// TODO

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L164
test('StringSegment_StringCtor_AllowsNullBuffers', () => {
	const segment = StringSegment.from(undefined);

	expect(segment.hasValue).toBe(false);
	expect(segment.offset).toBe(0);
	expect(segment.length).toBe(0);
	expect(segment.buffer).toBeUndefined();
	expect(segment.value).toBeUndefined();
	expect(() => segment.at(0)).toThrowError();
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L179
test('StringSegmentConstructor_NullBuffer_Throws', () => {
	expect(() => StringSegment.fromSegment(undefined, 0, 0)).toThrowError();
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L187
test('StringSegmentConstructor_NegativeOffset_Throws', () => {
	expect(() => StringSegment.fromSegment('', -1, 0));
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L195
test('StringSegmentConstructor_NegativeLength_Throws', () => {
	expect(() => StringSegment.fromSegment('', 0, -1));
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L207
test('StringSegmentConstructor_OffsetOrLengthOutOfBounds_Throws', () => {
	function StringSegmentConstructor_OffsetOrLengthOutOfBounds_Throws(
		offset: number,
		length: number,
	): void {
		expect(() => StringSegment.fromSegment('lengthof9', offset, length));
	}

	StringSegmentConstructor_OffsetOrLengthOutOfBounds_Throws(0, 10);
	StringSegmentConstructor_OffsetOrLengthOutOfBounds_Throws(10, 0);
	StringSegmentConstructor_OffsetOrLengthOutOfBounds_Throws(5, 5);
	StringSegmentConstructor_OffsetOrLengthOutOfBounds_Throws(
		Number.MIN_VALUE,
		Number.MAX_VALUE,
	);
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L216
test('StringSegmentConstructor_AllowsEmptyBuffers', () => {
	function StringSegmentConstructor_AllowsEmptyBuffers(
		text: string,
		offset: number,
		length: number,
	): void {
		const segment = StringSegment.fromSegment(text, offset, length);

		expect(segment.hasValue).toBe(true);
		expect(segment.offset).toBe(offset);
		expect(segment.length).toBe(length);
	}

	StringSegmentConstructor_AllowsEmptyBuffers('', 0, 0);
	StringSegmentConstructor_AllowsEmptyBuffers('abc', 2, 0);
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L228
test('StringSegment_StringCtor_InitializesValuesCorrectly', () => {
	const buffer = 'Hello world!';

	const segment = StringSegment.from(buffer);

	expect(segment.hasValue).toBe(true);
	expect(segment.offset).toBe(0);
	expect(segment.length).toBe(buffer.length);
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L243
test('StringSegment_Value_Valid', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 4);

	const value = segment.value;

	expect(value).toBe('ello');
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L256
test('StringSegment_Value_Invalid', () => {
	const segment = StringSegment.from(undefined);

	const value = segment.value;

	expect(value).toBeUndefined();
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L269
test('StringSegment_HasValue_Valid', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 4);

	const hasValue = segment.hasValue;

	expect(hasValue).toBe(true);
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L282
test('StringSegment_HasValue_Invalid', () => {
	const segment = StringSegment.from(undefined);

	const hasValue = segment.hasValue;

	expect(hasValue).toBe(false);
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L301
test('StringSegment_Indexer_InRange', () => {
	function StringSegment_Indexer_InRange(
		value: string,
		offset: number,
		length: number,
		index: number,
		expected: string,
	): void {
		const segment = StringSegment.fromSegment(value, offset, length);

		const result = segment.at(index);

		expect(result).toBe(expected);
	}

	StringSegment_Indexer_InRange('a', 0, 1, 0, 'a');
	StringSegment_Indexer_InRange('abc', 1, 1, 0, 'b');
	StringSegment_Indexer_InRange('abcdef', 1, 4, 0, 'b');
	StringSegment_Indexer_InRange('abcdef', 1, 4, 1, 'c');
	StringSegment_Indexer_InRange('abcdef', 1, 4, 2, 'd');
	StringSegment_Indexer_InRange('abcdef', 1, 4, 3, 'e');
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L314
test('StringSegment_Indexer_OutOfRangeThrows', () => {
	function StringSegment_Indexer_OutOfRangeThrows(
		value: string,
		offset: number,
		length: number,
		index: number,
	): void {
		const segment = StringSegment.fromSegment(value, offset, length);

		expect(() => segment.at(index)).toThrowError();
	}

	StringSegment_Indexer_OutOfRangeThrows('', 0, 0, 0);
	StringSegment_Indexer_OutOfRangeThrows('a', 0, 1, -1);
	StringSegment_Indexer_OutOfRangeThrows('a', 0, 1, 1);
});

// TODO

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L742
test('StringSegment_SubstringOffset_Valid', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 4);

	const result = segment.substring(1);

	expect(result).toBe('llo');
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L755
test('StringSegment_Substring_Valid', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 4);

	const result = segment.substring(1, 2);

	expect(result).toBe('ll');
});

// TODO

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L777
test('StringSegment_Substring_Invalid', () => {
	const segment = StringSegment.from(undefined);

	expect(() => segment.substring(0, 0)).toThrowError();
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L787
test('StringSegment_Substring_InvalidOffset', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 3);

	expect(() => segment.substring(-1, 1)).toThrowError();
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L798
test('StringSegment_Substring_InvalidLength', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 3);

	expect(() => segment.substring(0, -1)).toThrowError();
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L809
test('StringSegment_Substring_InvalidOffsetAndLength', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 3);

	expect(() => segment.substring(2, 3)).toThrowError();
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L820
test('StringSegment_Substring_OffsetAndLengthOverflows', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 3);

	expect(() => segment.substring(1, Number.MAX_VALUE)).toThrowError();
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L831
test('StringSegment_SubsegmentOffset_Valid', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 4);

	const result = segment.subsegment(1);

	expect(
		result.substring(0) ===
			StringSegment.fromSegment('Hello, World!', 2, 3).substring(0),
	).toBe(true);
	expect(result.value).toBe('llo');
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L845
test('StringSegment_Subsegment_Valid', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 4);

	const result = segment.subsegment(1, 2);

	expect(result.substring(0)).toBe(
		StringSegment.fromSegment('Hello, World!', 2, 2).substring(0),
	);
	expect(result.value).toBe('ll');
});

// TODO

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#LL868C3-L868C21
test('StringSegment_Subsegment_Invalid', () => {
	const segment = StringSegment.from(undefined);

	expect(() => segment.subsegment(0, 0)).toThrowError();
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L878
test('StringSegment_Subsegment_InvalidOffset', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 3);

	expect(() => segment.subsegment(-1, 1));
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L889
test('StringSegment_Subsegment_InvalidLength', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 3);

	expect(() => segment.subsegment(0, -1)).toThrowError();
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L900
test('StringSegment_Subsegment_InvalidOffsetAndLength', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 3);

	expect(() => segment.subsegment(2, 3)).toThrowError();
	// TODO
});

// https://github.com/dotnet/runtime/blob/99aa25fee09a3a66fb698720a234eb3d7770ca1a/src/libraries/Microsoft.Extensions.Primitives/tests/StringSegmentTest.cs#L911
test('StringSegment_Subsegment_OffsetAndLengthOverflows', () => {
	const segment = StringSegment.fromSegment('Hello, World!', 1, 3);

	expect(() => segment.subsegment(1, Number.MAX_VALUE)).toThrowError();
	// TODO
});

// TODO
