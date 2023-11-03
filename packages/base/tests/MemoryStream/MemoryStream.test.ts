import { MemoryStream, using } from '@yohira/base';
import { expect, test } from 'vitest';

// TODO

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStreamTests.cs#L24
test('MemoryStream_WriteToTests', () => {
	using(MemoryStream.alloc(), (ms2) => {
		const bytArr = Buffer.from([0, 255, 1, 2, 3, 4, 5, 6, 128, 250]);

		// [] Write to FileStream, check the filestream
		ms2.write(bytArr, 0, bytArr.length);

		using(MemoryStream.alloc(), (readonlyStream) => {
			ms2.writeTo(readonlyStream);
			readonlyStream.flush();
			readonlyStream.position = 0;
			const bytArrRet = Buffer.alloc(readonlyStream.length);
			readonlyStream.read(bytArrRet, 0, readonlyStream.length);
			for (let i = 0; i < bytArr.length; i++) {
				expect(bytArrRet[i]).toBe(bytArr[i]);
			}
		});

		// [] Write to memoryStream, check the memoryStream
		using(MemoryStream.alloc(), (ms2) => {
			using(MemoryStream.alloc(), (ms3) => {
				const bytArr = Buffer.from([
					0, 255, 1, 2, 3, 4, 5, 6, 128, 250,
				]);

				ms2.write(bytArr, 0, bytArr.length);
				ms2.writeTo(ms3);
				ms3.position = 0;
				const bytArrRet = Buffer.alloc(ms3.length);
				ms3.read(bytArrRet, 0, ms3.length);
				for (let i = 0; i < bytArr.length; i++) {
					expect(bytArrRet[i]).toBe(bytArr[i]);
				}
			});
		});
	});
});

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStreamTests.cs#L68
test('MemoryStream_WriteToTests_Negative', () => {
	using(MemoryStream.alloc(), (ms2) => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect(() => ms2.writeTo(undefined!)).toThrowError(
			'Value cannot be undefined.',
		);

		ms2.write(Buffer.from([1]), 0, 1);
		const readonlyStream = MemoryStream.from(
			Buffer.alloc(1028),
			0,
			1028,
			false,
		);
		expect(() => ms2.writeTo(readonlyStream)).toThrowError(
			'Stream does not support writing.',
		);

		readonlyStream[Symbol.dispose]();

		// [] Pass in a closed stream
		expect(() => ms2.writeTo(readonlyStream)).toThrowError(
			'Cannot access a closed Stream.',
		);
	});
});

class ReadWriteOverridingMemoryStream extends MemoryStream {
	readArrayInvoked = false;
	writeArrayInvoked = false;

	static alloc(capacity = 0): ReadWriteOverridingMemoryStream {
		if (capacity < 0) {
			throw new Error(
				`'capacity' must be a non-negative value.` /* LOC */,
			);
		}

		return new ReadWriteOverridingMemoryStream(
			/* _buffer */ capacity !== 0
				? Buffer.alloc(capacity)
				: Buffer.alloc(0) /* TODO */,
			/* _origin */ 0,
			/* _position */ 0,
			/* _length */ 0,
			/* _capacity */ capacity,
			/* _expandable */ true,
			/* _writable */ true,
			/* _exposable */ true,
			/* _isOpen */ true,
		);
	}

	read(buffer: Buffer, offset: number, count: number): number {
		this.readArrayInvoked = true;
		return super.read(buffer, offset, count);
	}

	write(buffer: Buffer, offset: number, count: number): void {
		this.writeArrayInvoked = true;
		super.write(buffer, offset, count);
	}
}

// https://github.com/dotnet/runtime/blob/1f86cb726cf2292c0bb68f455e223b41a7970740/src/libraries/System.IO/tests/MemoryStream/MemoryStreamTests.cs#L86
test('DerivedMemoryStream_ReadWriteSpanCalled_ReadWriteArrayUsed', () => {
	const s = ReadWriteOverridingMemoryStream.alloc();
	expect(s.writeArrayInvoked).toBe(false);
	expect(s.readArrayInvoked).toBe(false);

	s.write(Buffer.alloc(1), 0, 1);
	expect(s.writeArrayInvoked).toBe(true);
	expect(s.readArrayInvoked).toBe(false);

	s.position = 0;
	s.read(Buffer.alloc(1), 0, 1);
	expect(s.writeArrayInvoked).toBe(true);
	expect(s.readArrayInvoked).toBe(true);
});

// TODO
