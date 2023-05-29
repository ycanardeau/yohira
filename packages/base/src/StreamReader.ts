import { Stream } from './Stream';
import { StringBuilder } from './StringBuilder';
import { TextReader } from './TextReader';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/StreamReader.cs,b5fe1efcec14de32,references
export class StreamReader extends TextReader {
	// Using a 1K byte buffer and a 4K FileStream buffer works out pretty well
	// perf-wise.  On even a 40 MB text file, any perf loss by using a 4K
	// buffer is negated by the win of allocating a smaller byte[], which
	// saves construction time.  This does break adaptive buffering,
	// but this is slightly faster.
	private static readonly defaultBufferSize = 1024; // Byte buffer size
	private static readonly minBufferSize = 128;

	private readonly stream: Stream;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	private readonly byteBuffer: Buffer = undefined!; // only null in NullStreamReader where this is never used
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	private charBuffer: number[] = undefined!; // only null in NullStreamReader where this is never used
	private charPos = 0;
	private charLen = 0;
	// Record the number of valid bytes in the byteBuffer, for a few checks.
	private byteLen = 0;
	// This is used only for preamble detection
	private bytePos = 0;

	// This is the maximum number of chars we can get from one call to
	// ReadBuffer.  Used so ReadBuffer can tell when to copy data into
	// a user's char[] directly, instead of our internal char[].
	private maxCharsPerBuffer: number;

	/**
	 * True if the writer has been disposed; otherwise, false.
	 */
	private disposed = false;

	// We will support looking for byte order marks in the stream and trying
	// to decide what the encoding might be from the byte order marks, IF they
	// exist.  But that's all we'll do.
	private _detectEncoding = false;

	// Whether we must still check for the encoding's given preamble at the
	// beginning of this file.
	private checkPreamble = false;

	// Whether the stream is most likely not going to give us back as much
	// data as we want the next time we call it.  We must do the computation
	// before we do any byte order mark handling and save the result.  Note
	// that we need this to allow users to handle streams used for an
	// interactive protocol, where they block waiting for the remote end
	// to send a response, like logging in on a Unix machine.
	private isBlocked = false;

	// The intent of this field is to leave open the underlying stream when
	// disposing of this StreamReader.  A name like _leaveOpen is better,
	// but this type is serializable, and this field's name was _closable.
	private readonly closable: boolean;

	constructor(
		stream: Stream,
		//encoding = 'utf8',
		detectEncodingFromByteOrderMarks = true,
		//bufferSize = -1,
		leaveOpen = false,
	) {
		super();

		if (stream === undefined) {
			throw new Error('Value cannot be undefined.' /* LOC */);
		}

		if (!stream.canRead) {
			throw new Error('Stream was not readable.' /* LOC */);
		}

		let bufferSize = -1; /* TODO: remove */
		if (bufferSize === -1) {
			bufferSize = StreamReader.defaultBufferSize;
		}
		if (bufferSize <= 0) {
			throw new Error(
				`bufferSize ('${bufferSize}') must be a non-negative and non-zero value.` /* LOC */,
			);
		}

		this.stream = stream;
		//this.encoding = encoding ?? 'utf8';
		// TODO
		if (bufferSize < StreamReader.minBufferSize) {
			bufferSize = StreamReader.minBufferSize;
		}

		this.byteBuffer = Buffer.alloc(bufferSize);
		this.maxCharsPerBuffer = 1025 /* TODO: encoding.getMaxCharCount(bufferSize) */;
		this.charBuffer = new Array(this.maxCharsPerBuffer).fill(0);
		this._detectEncoding = detectEncodingFromByteOrderMarks;

		// If the preamble length is larger than the byte buffer length,
		// we'll never match it and will enter an infinite loop. This
		// should never happen in practice, but just in case, we'll skip
		// the preamble check for absurdly long preambles.
		const preambleLength = 3; /* TODO: encoding.preamble.length */
		this.checkPreamble = preambleLength > 0 && preambleLength <= bufferSize;

		this.closable = !leaveOpen;
	}

	protected disposeCore(disposing: boolean): void {
		if (this.disposed) {
			return;
		}
		this.disposed = true;

		// Dispose of our resources if this StreamReader is closable.
		if (this.closable) {
			try {
				// Note that Stream.Close() can potentially throw here. So we need to
				// ensure cleaning up internal resources, inside the finally block.
				if (disposing) {
					this.stream.close();
				}
			} finally {
				this.charPos = 0;
				this.charLen = 0;
				super.disposeCore(disposing);
			}
		}
	}

	private throwIfDisposed(): void {
		if (this.disposed) {
			throw new Error('Cannot read from a closed TextReader.' /* LOC */);
		}
	}

	// Trims n bytes from the front of the buffer.
	private compressBuffer(n: number): void {
		if (this.byteLen < n) {
			throw new Error(
				'CompressBuffer was called with a number of bytes greater than the current buffer length.  Are two threads using this StreamReader at the same time?',
			);
		}
		const byteBuffer = this.byteBuffer;
		// TODO
		byteBuffer.subarray(n, this.byteLen).copy(byteBuffer);
		this.byteLen -= n;
	}

	private detectEncoding(): void {
		if (this.byteLen < 2) {
			throw new Error(
				"Caller should've validated that at least 2 bytes were available.",
			);
		}

		const byteBuffer = this.byteBuffer;
		this._detectEncoding = false;
		let changedEncoding = false;

		const firstTwoBytes = byteBuffer.readUint16LE();
		if (firstTwoBytes === 0xfffe) {
			// Big Endian Unicode
			// TODO: this.encoding = Encoding.BigEndianUnicode;
			this.compressBuffer(2);
			changedEncoding = true;
		} else if (firstTwoBytes === 0xfeff) {
			// TODO
			throw new Error('Method not implemented.');
		} else if (
			this.byteLen >= 3 &&
			firstTwoBytes === 0xbbef &&
			byteBuffer[2] === 0xbf
		) {
			// UTF-8
			// TODO: this.encoding = Encoding.UTF8;
			this.compressBuffer(3);
			changedEncoding = true;
		} else if (
			this.byteLen >= 4 &&
			firstTwoBytes === 0 &&
			byteBuffer[2] === 0xfe &&
			byteBuffer[3] === 0xff
		) {
			// Big Endian UTF32
			// TODO: this.encoding =
			this.compressBuffer(4);
			changedEncoding = true;
		} else if (this.byteLen === 2) {
			this._detectEncoding = true;
		}
		// Note: in the future, if we change this algorithm significantly,
		// we can support checking for the preamble of the given encoding.

		if (changedEncoding) {
			// TODO
			const newMaxCharsPerBuffer = 1025; /* TODO: this.encoding.getMaxCharCount(byteBuffer.length) */
			if (newMaxCharsPerBuffer > this.maxCharsPerBuffer) {
				this.charBuffer = new Array(newMaxCharsPerBuffer).fill(0);
			}
			this.maxCharsPerBuffer = newMaxCharsPerBuffer;
		}
	}

	// Trims the preamble bytes from the byteBuffer. This routine can be called multiple times
	// and we will buffer the bytes read until the preamble is matched or we determine that
	// there is no match. If there is no match, every byte read previously will be available
	// for further consumption. If there is a match, we will compress the buffer for the
	// leading preamble bytes
	private isPreamble(): boolean {
		if (!this.checkPreamble) {
			return false;
		}

		const isPreambleWorker = (): boolean => {
			if (!this.checkPreamble) {
				throw new Error('Assertion failed.');
			}
			const preamble = Buffer.from([
				0xef, 0xbb, 0xbf,
			]); /* TODO: this.encoding.preamble */

			if (this.bytePos >= preamble.length) {
				throw new Error(
					'_compressPreamble was called with the current bytePos greater than the preamble buffer length.  Are two threads using this StreamReader at the same time?',
				);
			}
			const len = Math.min(this.byteLen, preamble.length);

			for (let i = this.bytePos; i < len; i++) {
				if (this.byteBuffer[i] !== preamble[i]) {
					this.bytePos = 0; // preamble match failed; back up to beginning of buffer
					this.checkPreamble = false;
					return false;
				}
			}
			this.bytePos = len; // we've matched all bytes up to this point

			if (this.bytePos > preamble.length) {
				throw new Error(
					'possible bug in _compressPreamble.  Are two threads using this StreamReader at the same time?',
				);
			}

			if (this.bytePos === preamble.length) {
				// We have a match
				this.compressBuffer(preamble.length);
				this.bytePos = 0;
				this.checkPreamble = false;
				this._detectEncoding = false;
			}

			return this.checkPreamble;
		};
		return isPreambleWorker();
	}

	/** @internal */ readBuffer(): number {
		this.charLen = 0;
		this.charPos = 0;

		if (!this.checkPreamble) {
			this.byteLen = 0;
		}

		let eofReached = false;

		do {
			if (this.checkPreamble) {
				if (
					this.bytePos > 3 /* TODO: this.encoding.preamble.length */
				) {
					throw new Error(
						'possible bug in _compressPreamble.  Are two threads using this StreamReader at the same time?',
					);
				}
				const len = this.stream.read(
					this.byteBuffer,
					this.bytePos,
					this.byteBuffer.length - this.bytePos,
				);
				if (len < 0) {
					throw new Error(
						'Stream.Read returned a negative number!  This is a bug in your stream class.',
					);
				}

				if (len === 0) {
					eofReached = true;
					break;
				}

				this.byteLen += len;
			} else {
				if (this.bytePos !== 0) {
					throw new Error(
						'bytePos can be non zero only when we are trying to _checkPreamble.  Are two threads using this StreamReader at the same time?',
					);
				}
				this.byteLen = this.stream.read(
					this.byteBuffer,
					0,
					this.byteBuffer.length,
				);
				if (this.byteLen < 0) {
					throw new Error(
						'Stream.Read returned a negative number!  This is a bug in your stream class.',
					);
				}

				if (this.byteLen === 0) {
					eofReached = true;
					break;
				}
			}

			// _isBlocked == whether we read fewer bytes than we asked for.
			// Note we must check it here because CompressBuffer or
			// DetectEncoding will change byteLen.
			this.isBlocked = this.byteLen < this.byteBuffer.length;

			// Check for preamble before detect encoding. This is not to override the
			// user supplied Encoding for the one we implicitly detect. The user could
			// customize the encoding which we will loose, such as ThrowOnError on UTF8
			if (this.isPreamble()) {
				continue;
			}

			// If we're supposed to detect the encoding and haven't done so yet,
			// do it.  Note this may need to be called more than once.
			if (this._detectEncoding && this.byteLen >= 2) {
				this.detectEncoding();
			}

			if (this.charPos !== 0 || this.charLen !== 0) {
				throw new Error(
					"We shouldn't be trying to decode more data if we made progress in an earlier iteration.",
				);
			}
			// REVIEW
			const string = this.byteBuffer
				.subarray(0, this.byteLen)
				.toString('utf8' /* TODO */);
			this.charLen = string.length;
			for (let i = 0; i < this.charLen; i++) {
				this.charBuffer[i] = string.charCodeAt(i);
			}
		} while (this.charLen === 0);

		if (eofReached) {
			// EOF has been reached - perform final flush.
			// We need to reset _bytePos and _byteLen just in case we hadn't
			// finished processing the preamble before we reached EOF.

			if (this.charPos !== 0 || this.charLen !== 0) {
				throw new Error(
					"We shouldn't be looking for EOF unless we have an empty char buffer.",
				);
			}
			// REVIEW
			const string = this.byteBuffer
				.subarray(0, this.byteLen)
				.toString('utf8' /* TODO */);
			this.charLen = string.length;
			for (let i = 0; i < this.charLen; i++) {
				this.charBuffer[i] = string.charCodeAt(i);
			}
			this.bytePos = 0;
			this.byteLen = 0;
		}

		return this.charLen;
	}

	readToEnd(): string {
		this.throwIfDisposed();
		// TODO

		const sb = new StringBuilder(/* TODO: this.charLen - this.charPos */);
		do {
			sb.appendChars(
				this.charBuffer,
				this.charPos,
				this.charLen - this.charPos,
			);
			this.charPos = this.charLen; // Note we consumed these characters
			this.readBuffer();
		} while (this.charLen > 0);
		return sb.toString();
	}
}
