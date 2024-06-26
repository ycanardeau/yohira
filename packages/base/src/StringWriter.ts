import { StringBuilder } from './StringBuilder';
import { TextWriter } from './TextWriter';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/StringWriter.cs,fd76db5d443fe076,references
export class StringWriter extends TextWriter {
	private isOpen = true;

	constructor(private readonly sb: StringBuilder = new StringBuilder()) {
		super();
	}

	[Symbol.dispose](): void {
		this.isOpen = false;
		super[Symbol.dispose]();
	}

	// Writes a character to the underlying string buffer.
	//
	writeChar(value: number): void {
		if (!this.isOpen) {
			throw new Error('Cannot write to a closed TextWriter.' /* LOC */);
		}

		this.sb.appendChar(value);
	}

	toString(): string {
		return this.sb.toString();
	}
}
