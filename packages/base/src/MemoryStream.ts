import { Err, Ok, Result } from '@yohira/third-party.ts-results';

import { IDisposable } from './IDisposable';
import { SeekOrigin } from './SeekOrigin';
import { Stream } from './Stream';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/MemoryStream.cs,044ce0129bdbdc11
export class MemoryStream extends Stream implements IDisposable {
	protected constructor(
		private _buffer: Buffer,
		private readonly _origin: number,
		private _position: number,
		private _length: number,
		private _capacity: number,
		private _expandable: boolean,
		private _writable: boolean,
		private readonly _exposable: boolean,
		private _isOpen: boolean,
	) {
		super();
	}

	static alloc(capacity = 0): MemoryStream {
		if (capacity < 0) {
			throw new Error(
				`'capacity' must be a non-negative value.` /* LOC */,
			);
		}

		return new MemoryStream(
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

	static from(
		buffer: Buffer,
		index: number,
		count: number,
		writable = true,
		publiclyVisible = false,
	): MemoryStream {
		if (buffer === undefined) {
			throw new Error('Value cannot be null.' /* LOC */);
		}

		if (index < 0) {
			throw new Error(`'index' must be a non-negative value.` /* LOC */);
		}
		if (count < 0) {
			throw new Error(`'count' must be a non-negative value.` /* LOC */);
		}
		if (buffer.length - index < count) {
			throw new Error(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.' /* LOC */,
			);
		}

		return new MemoryStream(
			/* _buffer */ buffer,
			/* _origin */ index,
			/* _position */ index,
			/* _length */ index + count,
			/* _capacity */ index + count,
			/* _expandable */ false,
			/* _writable */ writable,
			/* _exposable */ publiclyVisible,
			/* _isOpen */ true,
		);
	}

	get canRead(): boolean {
		return this._isOpen;
	}

	get canSeek(): boolean {
		return this._isOpen;
	}

	get canWrite(): boolean {
		return this._writable;
	}

	private ensureNotClosed(): void {
		if (!this._isOpen) {
			throw new Error('Cannot access a closed Stream.' /* LOC */);
		}
	}

	private ensureWritable(): void {
		if (!this.canWrite) {
			throw new Error('Stream does not support writing.' /* LOC */);
		}
	}

	protected disposeCore(disposing: boolean): void {
		if (disposing) {
			this._isOpen = false;
			this._writable = false;
			this._expandable = false;
			// TODO
		}
	}

	getBuffer(): Buffer {
		if (!this._exposable) {
			throw new Error(
				"MemoryStream's internal buffer cannot be accessed." /* LOC */,
			);
		}
		return this._buffer;
	}

	tryGetBuffer(): Result<Buffer, Buffer> {
		if (!this._exposable) {
			return new Err(Buffer.alloc(0) /* TODO */);
		}

		return new Ok(this._buffer.subarray(this._origin, this._length));
	}

	get length(): number {
		this.ensureNotClosed();
		return this._length - this._origin;
	}

	get position(): number {
		this.ensureNotClosed();
		return this._position - this._origin;
	}
	set position(value: number) {
		if (value < 0) {
			throw new Error(
				`'${value}' must be a non-negative value.` /* LOC */,
			);
		}
		this.ensureNotClosed();

		// TODO
		this._position = this._origin + value;
	}

	get capacity(): number {
		this.ensureNotClosed();
		return this._capacity - this._origin;
	}
	set capacity(value: number) {
		// Only update the capacity if the MS is expandable and the value is different than the current capacity.
		// Special behavior if the MS isn't expandable: we don't throw if value is the same as the current capacity
		if (value < this.length) {
			throw new Error(
				'capacity was less than the current size.' /* LOC */,
			);
		}

		this.ensureNotClosed();

		if (!this._expandable && value !== this.capacity) {
			throw new Error('Memory stream is not expandable.');
		}

		// MemoryStream has this invariant: _origin > 0 => !expandable (see ctors)
		if (this._expandable && value !== this._capacity) {
			if (value > 0) {
				const newBuffer = Buffer.alloc(value);
				if (this._length > 0) {
					this._buffer.copy(newBuffer, 0, 0, this._length);
				}
				this._buffer = newBuffer;
			} else {
				this._buffer = Buffer.alloc(0) /* TODO */;
			}
			this._capacity = value;
		}
	}

	read(buffer: Buffer, offset: number, count: number): number {
		Stream.validateBufferArguments(buffer, offset, count);
		this.ensureNotClosed();

		let n = this._length - this._position;
		if (n > count) {
			n = count;
		}
		if (n <= 0) {
			return 0;
		}

		if (this._position + n < 0) {
			throw new Error('_position + n >= 0'); // len is less than 2^31 -1.
		}

		if (n <= 8) {
			let byteCount = n;
			while (--byteCount >= 0) {
				buffer[offset + byteCount] =
					this._buffer[this._position + byteCount];
			}
		} else {
			this._buffer.copy(
				buffer,
				offset,
				this._position,
				this._position + n,
			);
		}
		this._position += n;

		return n;
	}

	seek(offset: number, loc: SeekOrigin): number {
		this.ensureNotClosed();

		// TODO

		switch (loc) {
			case SeekOrigin.Begin: {
				const tempPosition = this._origin + offset;
				if (offset < 0 || tempPosition < this._origin) {
					throw new Error(
						'An attempt was made to move the position before the beginning of the stream.' /* LOC */,
					);
				}
				this._position = tempPosition;
				break;
			}
			case SeekOrigin.Current: {
				const tempPosition = this._position + offset;
				if (
					this._position + offset < this._origin ||
					tempPosition < this._origin
				) {
					throw new Error(
						'An attempt was made to move the position before the beginning of the stream.' /* LOC */,
					);
				}
				this._position = tempPosition;
				break;
			}
			case SeekOrigin.End: {
				const tempPosition = this._length + offset;
				if (
					this._length + offset < this._origin ||
					tempPosition < this._origin
				) {
					throw new Error(
						'An attempt was made to move the position before the beginning of the stream.' /* LOC */,
					);
				}
				this._position = tempPosition;
				break;
			}
		}

		if (this._position < 0) {
			throw new Error('Assertion failed.');
		}
		return this._position;
	}

	toBuffer(): Buffer {
		const count = this._length - this._origin;
		if (count === 0) {
			return Buffer.alloc(0); /* TODO */
		}
		const copy = Buffer.alloc(count);
		this._buffer.subarray(this._origin, this._origin + count).copy(copy);
		return copy;
	}

	flush(): void {}

	// returns a bool saying whether we allocated a new array.
	private ensureCapacity(value: number): boolean {
		// Check for overflow
		if (value < 0) {
			throw new Error(/* TODO: message */);
		}

		if (value > this._capacity) {
			let newCapacity = Math.max(value, 256);

			if (newCapacity < this._capacity * 2) {
				newCapacity = this._capacity * 2;
			}

			// TODO

			this.capacity = newCapacity;
			return true;
		}
		return false;
	}

	write(buffer: Buffer, offset: number, count: number): void {
		Stream.validateBufferArguments(buffer, offset, count);
		this.ensureNotClosed();
		this.ensureWritable();

		const i = this._position + count;
		// Check for overflow
		if (i < 0) {
			throw new Error(/* TODO: message */);
		}

		if (i > this._length) {
			let mustZero = this._position > this._length;
			if (i > this._capacity) {
				const allocatedNewArray = this.ensureCapacity(i);
				if (allocatedNewArray) {
					mustZero = false;
				}
			}
			if (mustZero) {
				this._buffer.fill(0, this._length, i);
			}
			this._length = i;
		}
		if (count <= 8 && buffer !== this._buffer) {
			let byteCount = count;
			while (--byteCount >= 0) {
				this._buffer[this._position + byteCount] =
					buffer[offset + byteCount];
			}
		} else {
			buffer.copy(this._buffer, this._position, offset, offset + count);
		}
		this._position = i;
	}

	writeByte(value: number): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	// Writes this MemoryStream to another stream.
	writeTo(stream: Stream): void {
		if (stream === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}

		this.ensureNotClosed();

		stream.write(this._buffer, this._origin, this._length - this._origin);
	}
}
