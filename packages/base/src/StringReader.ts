import { TextReader } from './TextReader';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/StringReader.cs,307ff4f1cbcfd44e,references
export class StringReader extends TextReader {
	private s: string | undefined;
	private pos = 0;

	constructor(s: string) {
		super();

		this.s = s;
	}

	[Symbol.dispose](): void {
		this.s = undefined;
		this.pos = 0;
	}

	// Reads the next character from the underlying string. The returned value
	// is -1 if no further characters are available.
	//
	readChar(): number {
		const s = this.s;
		if (s === undefined) {
			throw new Error(/* TODO: message */);
		}

		const pos = this.pos;
		if (pos < s.length) {
			this.pos++;
			return s.charCodeAt(pos);
		}

		return -1;
	}
}
