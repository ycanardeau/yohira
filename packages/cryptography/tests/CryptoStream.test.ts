import { MemoryStream, Stream, StreamReader, using } from '@yohira/base';
import {
	Aes,
	CryptoStream,
	CryptoStreamMode,
	ICryptoTransform,
} from '@yohira/cryptography';
import { expect, test } from 'vitest';

const LoremText = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa.
  Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna.
  Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
  Proin pharetra nonummy pede. Mauris et orci.
  Aenean nec lorem. In porttitor. Donec laoreet nonummy augue.
  Suspendisse dui purus, scelerisque at, vulputate vitae, pretium mattis, nunc. Mauris eget neque at sem venenatis eleifend.
  Ut nonummy.`;

class DerivedCryptoStream extends CryptoStream {
	disposeInvoked = false;
	constructor(
		stream: Stream,
		transform: ICryptoTransform,
		mode: CryptoStreamMode,
	) {
		super(stream, transform, mode);
	}

	protected disposeCore(disposing: boolean): void {
		this.disposeInvoked = true;
		super.disposeCore(disposing);
	}
}

class IdentityTransform implements ICryptoTransform {
	private readonly _inputBlockSize: number;
	private readonly _outputBlockSize: number;
	private readonly _canTransformMultipleBlocks: boolean;
	// TODO: lock

	private writePos = 0;
	private readPos = 0;
	private stream: MemoryStream;

	constructor(
		inputBlockSize: number,
		outputBlockSize: number,
		canTransformMultipleBlocks: boolean,
	) {
		this._inputBlockSize = inputBlockSize;
		this._outputBlockSize = outputBlockSize;
		this._canTransformMultipleBlocks = canTransformMultipleBlocks;
		this.stream = MemoryStream.alloc();
	}

	get canTransformMultipleBlocks(): boolean {
		return this._canTransformMultipleBlocks;
	}

	get inputBlockSize(): number {
		return this._inputBlockSize;
	}

	get outputBlockSize(): number {
		return this._outputBlockSize;
	}

	dispose(): void {}

	transformBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
		outputBuffer: Buffer,
		outputOffset: number,
	): number {
		// REVIEW: lock
		{
			this.stream.position = this.writePos;
			this.stream.write(inputBuffer, inputOffset, inputCount);
			this.writePos = this.stream.position;

			this.stream.position = this.readPos;
			const copied = this.stream.read(
				outputBuffer,
				outputOffset,
				outputBuffer.length - outputOffset,
			);
			this.readPos = this.stream.position;
			return copied;
		}
	}

	transformFinalBlock(
		inputBuffer: Buffer,
		inputOffset: number,
		inputCount: number,
	): Buffer {
		// REVIEW: lock
		{
			this.stream.position = this.writePos;
			this.stream.write(inputBuffer, inputOffset, inputCount);

			this.stream.position = this.readPos;
			const len = this.stream.length - this.stream.position;
			const outputBuffer = Buffer.alloc(len);
			this.stream.read(outputBuffer, 0, outputBuffer.length);

			this.stream = MemoryStream.alloc();
			this.writePos = 0;
			this.readPos = 0;
			return outputBuffer;
		}
	}
}

class MinimalCryptoStream extends CryptoStream {
	flushCalled = false;

	constructor(
		stream: Stream,
		transform: ICryptoTransform,
		mode: CryptoStreamMode,
	) {
		super(stream, transform, mode);
	}

	flush(): void {
		this.flushCalled = true;
		super.flush();
	}
}

// TODO: WrappingConnectedStreamConformanceTests

// TODO

// https://github.com/dotnet/runtime/blob/75d4283ea04735119ffa1ac42ceb667b66c4cf12/src/libraries/System.Security.Cryptography/tests/CryptoStream.cs#L56
test('Roundtrip', () => {
	function Roundtrip(
		inputBlockSize: number,
		outputBlockSize: number,
		canTransformMultipleBlocks: boolean,
	): void {
		const ExpectedString =
			LoremText +
			LoremText +
			LoremText; /* TODO: + LoremText + LoremText */
		const encryptor = new IdentityTransform(
			inputBlockSize,
			outputBlockSize,
			canTransformMultipleBlocks,
		);
		const decryptor = new IdentityTransform(
			inputBlockSize,
			outputBlockSize,
			canTransformMultipleBlocks,
		);

		let stream = MemoryStream.alloc();
		using(
			new CryptoStream(stream, encryptor, CryptoStreamMode.Write),
			(encryptStream) => {
				expect(encryptStream.canWrite).toBe(true);
				expect(encryptStream.canRead).toBe(false);
				expect(encryptStream.canSeek).toBe(false);
				expect(encryptStream.hasFlushedFinalBlock).toBe(false);

				const toWrite = Buffer.from(LoremText);

				// Write it all at once
				encryptStream.write(toWrite, 0, toWrite.length);
				expect(encryptStream.hasFlushedFinalBlock).toBe(false);

				// Write in chunks
				encryptStream.write(toWrite, 0, toWrite.length / 2);
				encryptStream.write(
					toWrite,
					toWrite.length / 2,
					toWrite.length - toWrite.length / 2,
				);
				expect(encryptStream.hasFlushedFinalBlock).toBe(false);

				// Write one byte at a time
				for (let i = 0; i < toWrite.length; i++) {
					encryptStream.writeByte(toWrite[i]);
				}
				expect(encryptStream.hasFlushedFinalBlock).toBe(false);

				// TODO

				// Flush (nops)
				encryptStream.flush();

				encryptStream.flushFinalBlock();
				expect(() => encryptStream.flushFinalBlock()).toThrowError(
					'flushFinalBlock() method was called twice on a CryptoStream. It can only be called once.',
				);
				expect(encryptStream.hasFlushedFinalBlock).toBe(true);

				expect(stream.length > 0).toBe(true);
			},
		);

		// Read/decrypt using Read
		let buffer = stream.toBuffer();
		stream = MemoryStream.from(buffer, 0, buffer.length); // CryptoStream.dispose disposes the stream
		using(
			new CryptoStream(stream, decryptor, CryptoStreamMode.Read),
			(decryptStream) => {
				expect(decryptStream.canWrite).toBe(false);
				expect(decryptStream.canRead).toBe(true);
				expect(decryptStream.canSeek).toBe(false);
				expect(decryptStream.hasFlushedFinalBlock).toBe(false);

				using(new StreamReader(decryptStream), (reader) => {
					expect(reader.readToEnd()).toBe(ExpectedString);
				});
			},
		);

		// TODO

		// Read/decrypt one byte at a time with ReadByte
		buffer = stream.toBuffer();
		stream = MemoryStream.from(buffer, 0, buffer.length);
		using(
			new CryptoStream(stream, decryptor, CryptoStreamMode.Read),
			(decryptStream) => {
				for (const c of ExpectedString) {
					expect(decryptStream.readByte()).toBe(c.charCodeAt(0));
				}
				expect(decryptStream.readByte()).toBe(-1);
			},
		);
	}

	Roundtrip(64, 64, true);
	Roundtrip(64, 128, true);
	Roundtrip(128, 64, true);
	Roundtrip(1, 1, true);
	Roundtrip(37, 24, true);
	Roundtrip(128, 3, true);
	Roundtrip(8192, 64, true);
	Roundtrip(64, 64, false);
});

// https://github.com/dotnet/runtime/blob/75d4283ea04735119ffa1ac42ceb667b66c4cf12/src/libraries/System.Security.Cryptography/tests/CryptoStream.cs#L151
test('Clear', () => {
	const encryptor = new IdentityTransform(1, 1, true);
	using(MemoryStream.alloc(), (output) => {
		using(
			new CryptoStream(output, encryptor, CryptoStreamMode.Write),
			(encryptStream) => {
				encryptStream.clear();
				expect(() =>
					encryptStream.write(Buffer.from([1, 2, 3, 4, 5]), 0, 5),
				).toThrowError('Stream does not support writing.');
			},
		);
	});
});

// https://github.com/dotnet/runtime/blob/75d4283ea04735119ffa1ac42ceb667b66c4cf12/src/libraries/System.Security.Cryptography/tests/CryptoStream.cs#L163
test('FlushFinalBlockAsync', () => {
	const encryptor = new IdentityTransform(1, 1, true);
	using(MemoryStream.alloc(), (output) => {
		using(
			new CryptoStream(output, encryptor, CryptoStreamMode.Write),
			(encryptStream) => {
				encryptStream.write(Buffer.from([1, 2, 3, 4, 5]), 0, 5);
				encryptStream.flushFinalBlock();
				expect(encryptStream.hasFlushedFinalBlock).toBe(true);
				expect(output.toBuffer().length).toBe(5);
			},
		);
	});
});

// TODO

// https://github.com/dotnet/runtime/blob/75d4283ea04735119ffa1ac42ceb667b66c4cf12/src/libraries/System.Security.Cryptography/tests/CryptoStream.cs#L206
test('MultipleDispose', () => {
	const encryptor = new IdentityTransform(1, 1, true);

	using(MemoryStream.alloc(), (output) => {
		using(
			new CryptoStream(output, encryptor, CryptoStreamMode.Write),
			(encryptStream) => {
				encryptStream.dispose();
			},
		);

		expect(output.canRead).toBe(false);
	});

	using(MemoryStream.alloc(), (output) => {
		using(
			new CryptoStream(output, encryptor, CryptoStreamMode.Write, false),
			(encryptStream) => {
				encryptStream.dispose();
			},
		);

		expect(output.canRead).toBe(false);
	});

	using(MemoryStream.alloc(), (output) => {
		using(
			new CryptoStream(output, encryptor, CryptoStreamMode.Write, true),
			(encryptStream) => {
				encryptStream.dispose();
			},
		);

		expect(output.canRead).toBe(true);
	});
});

// https://github.com/dotnet/runtime/blob/75d4283ea04735119ffa1ac42ceb667b66c4cf12/src/libraries/System.Security.Cryptography/tests/CryptoStream.cs#L244
test('DisposeAsync_DataFlushedCorrectly', () => {
	function DisposeAsync_DataFlushedCorrectly(
		explicitFlushFinalBeforeDispose: boolean,
	): void {
		const text = 'hello';

		let stream = MemoryStream.alloc();
		using(
			new CryptoStream(
				stream,
				new IdentityTransform(64, 64, true),
				CryptoStreamMode.Write,
			),
			(encryptStream) => {
				expect(stream.position).toBe(0);

				const toWrite = Buffer.from(text, 'utf8');
				encryptStream.write(toWrite, 0, toWrite.length);
				expect(encryptStream.hasFlushedFinalBlock).toBe(false);
				expect(stream.position).toBe(0);

				if (explicitFlushFinalBeforeDispose) {
					encryptStream.flushFinalBlock();
				}

				encryptStream.dispose();
				expect(encryptStream.hasFlushedFinalBlock).toBe(true);
				expect(stream.toBuffer().length).toBe(5);

				// TODO
			},
		);

		const buffer = stream.toBuffer();
		stream = MemoryStream.from(buffer, 0, buffer.length); // CryptoStream.dispose disposes the stream
		using(
			new CryptoStream(
				stream,
				new IdentityTransform(64, 64, true),
				CryptoStreamMode.Read,
			),
			(decryptStream) => {
				using(new StreamReader(decryptStream), (reader) => {
					expect(reader.readToEnd()).toBe(text);
				});

				// TODO
			},
		);
	}

	DisposeAsync_DataFlushedCorrectly(false);
	DisposeAsync_DataFlushedCorrectly(true);
});

// https://github.com/dotnet/runtime/blob/75d4283ea04735119ffa1ac42ceb667b66c4cf12/src/libraries/System.Security.Cryptography/tests/CryptoStream.cs#L283
test('DisposeAsync_DerivedStream_InvokesDispose', () => {
	const stream = MemoryStream.alloc();
	using(
		new DerivedCryptoStream(
			stream,
			new IdentityTransform(64, 64, true),
			CryptoStreamMode.Write,
		),
		(encryptStream) => {
			expect(encryptStream.disposeInvoked).toBe(false);
			encryptStream.dispose(); /* TODO */
			expect(encryptStream.disposeInvoked).toBe(true);
		},
	);
});

// https://github.com/dotnet/runtime/blob/75d4283ea04735119ffa1ac42ceb667b66c4cf12/src/libraries/System.Security.Cryptography/tests/CryptoStream.cs#L295
test('PaddedAes_PartialRead_Success', () => {
	using(Aes.create(), (aes) => {
		aes.mode = 'cbc';
		aes.key = Buffer.from([
			0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc,
			0xd, 0xe, 0xf,
		]);

		const memoryStream = MemoryStream.alloc();
		using(aes.createEncryptor(), (encryptor) => {
			using(
				new CryptoStream(
					memoryStream,
					encryptor,
					CryptoStreamMode.Write,
					true,
				),
				(cryptoStream) => {
					const buffer = Buffer.from(
						"Sample string that's bigger than cryptoAlg.blockSize",
						'utf8',
					);
					cryptoStream.write(buffer, 0, buffer.length);
					cryptoStream.flushFinalBlock();
				},
			);
		});

		memoryStream.position = 0;
		using(aes.createDecryptor(), (decryptor) => {
			using(
				new CryptoStream(
					memoryStream,
					decryptor,
					CryptoStreamMode.Read,
				),
				(cryptoStream) => {
					cryptoStream.readByte(); // Partially read the CryptoStream before disposing it.
				},
			);
		});

		// No exception should be thrown.
	});
});

// TODO
