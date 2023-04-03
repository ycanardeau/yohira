import { IDisposable } from './IDisposable';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/TextReader.cs,7b5eff52b5bf1164,references
export abstract class TextReader implements IDisposable {
	protected constructor() {}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	// Reads the next character from the input stream. The returned value is
	// -1 if no further characters are available.
	//
	// This default method simply returns -1.
	//
	readChar(): number {
		return -1;
	}

	// Reads a block of characters. This method will read up to
	// count characters from this TextReader into the
	// buffer character array starting at position
	// index. Returns the actual number of characters read.
	//
	read(buffer: number[], index: number, count: number): number {
		if (buffer.length - index < count) {
			throw new Error(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.' /* LOC */,
			);
		}

		let n = 0;
		for (n = 0; n < count; n++) {
			const ch = this.readChar();
			if (ch === -1) {
				break;
			}
			buffer[index + n] = ch;
		}

		return n;
	}
}
