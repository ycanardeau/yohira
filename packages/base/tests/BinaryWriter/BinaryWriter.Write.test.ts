import { BinaryReader, BinaryWriter, MemoryStream, using } from '@yohira/base';
import { expect, test } from 'vitest';

function createStream(): MemoryStream {
	return MemoryStream.alloc();
}

function writeTest<T>(
	testElements: T[],
	write: (bw: BinaryWriter, s: T) => void,
	read: (br: BinaryReader) => T,
): void {
	using(createStream(), (memStream) => {
		using(new BinaryWriter(memStream), (writer) => {
			using(new BinaryReader(memStream), (reader) => {
				for (let i = 0; i < testElements.length; i++) {
					write(writer, testElements[i]);
				}

				writer.flush();
				memStream.position = 0;

				for (let i = 0; i < testElements.length; i++) {
					expect(read(reader)).toBe(testElements[i]);
				}

				// TODO: expect(() => read(reader)).toThrowError();
			});
		});
	});
}

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/BinaryWriter/BinaryWriter.WriteTests.cs#L12
test('BinaryWriter_WriteBoolTest', () => {
	using(createStream(), (mstr) => {
		using(new BinaryWriter(mstr), (dw2) => {
			using(new BinaryReader(mstr), (dr2) => {
				dw2.writeBoolean(false);
				dw2.writeBoolean(false);
				dw2.writeBoolean(true);
				dw2.writeBoolean(false);
				dw2.writeBoolean(true);
				dw2.writeInt32LE(5);
				dw2.writeInt32LE(0);

				dw2.flush();
				mstr.position = 0;

				expect(dr2.readBoolean()).toBe(false);
				expect(dr2.readBoolean()).toBe(false);
				expect(dr2.readBoolean()).toBe(true);
				expect(dr2.readBoolean()).toBe(false);
				expect(dr2.readBoolean()).toBe(true);
				expect(dr2.readInt32LE()).toBe(5);
				expect(dr2.readInt32LE()).toBe(0);
			});
		});
	});
});

// TODO

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/BinaryWriter/BinaryWriter.WriteTests.cs#L86
test('BinaryWriter_WriteInt16Test', () => {
	const i16Arr = [
		-32768 /* short.MinValue */, 32767 /* short.MaxValue */, 0, -10000,
		10000, -50, 50,
	];

	writeTest(
		i16Arr,
		(bw, s) => bw.writeInt16LE(s),
		(br) => br.readInt16LE(),
	);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/BinaryWriter/BinaryWriter.WriteTests.cs#L94
test('BinaryWriter_WriteInt32Test', () => {
	const i32arr = [
		-2147483648 /* int.MinValue */, 2147483647 /* int.MaxValue */, 0,
		-10000, 10000, -50, 50,
	];

	writeTest(
		i32arr,
		(bw, s) => bw.writeInt32LE(s),
		(br) => br.readInt32LE(),
	);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/BinaryWriter/BinaryWriter.WriteTests.cs#L102
test('BinaryWriter_Write7BitEncodedIntTest', () => {
	const i32arr = [
		-2147483648 /* int.MinValue */,
		2147483647 /* int.MaxValue */,
		0,
		-10000,
		10000,
		-50,
		50,
		0 /* uint.MinValue */,
		-1 /* uint.MaxValue */,
		-1 /* uint.MaxValue */ - 100,
	];

	writeTest(
		i32arr,
		(bw, s) => bw.write7BitEncodedInt(s),
		(br) => br.read7BitEncodedInt(),
	);
});

// TODO

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/BinaryWriter/BinaryWriter.WriteTests.cs#L134
test('BinaryWriter_WriteUInt16Test', () => {
	const ui16Arr = [
		0 /* ushort.MinValue */,
		65535 /* ushort.MaxValue */,
		0,
		100,
		1000,
		10000,
		65535 /* ushort.MaxValue */ - 100,
	];

	writeTest(
		ui16Arr,
		(bw, s) => bw.writeUint16LE(s),
		(br) => br.readUint16LE(),
	);
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/BinaryWriter/BinaryWriter.WriteTests.cs#L142
test('BinaryWriter_WriteUInt32Test', () => {
	const ui32Arr = [
		0 /* uint.MinValue */,
		4294967295 /* uint.MaxValue */,
		0,
		100,
		1000,
		10000,
		4294967295 /* uint.MaxValue */ - 100,
	];

	writeTest(
		ui32Arr,
		(bw, s) => bw.writeUint32LE(s),
		(br) => br.readUint32LE(),
	);
});

// TODO
