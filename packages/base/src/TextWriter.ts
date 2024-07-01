// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/TextWriter.cs,6e84a88dc2be46e3,references
export abstract class TextWriter implements Disposable {
	[Symbol.dispose](): void {
		// TODO
		//throw new Error('Method not implemented.');
	}

	flush(): void {}

	// Writes a character to the text stream. This default method is empty,
	// but descendant classes can override the method to provide the
	// appropriate functionality.
	//
	writeChar(value: number): void {}

	writeChars(buffer: number[], index: number, count: number): void {
		if (index < 0) {
			throw new Error(
				`index ('${index}') must be a non-negative value.` /* LOC */,
			);
		}
		if (count < 0) {
			throw new Error(
				`count ('${count}') must be a non-negative value.` /* LOC */,
			);
		}
		if (buffer.length - index < count) {
			throw new Error(
				'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.' /* LOC */,
			);
		}

		for (let i = 0; i < count; i++) {
			this.writeChar(buffer[index + i]);
		}
	}

	writeString(value: string | undefined): void {
		if (value !== undefined) {
			const chars = value.split('').map((char) => char.charCodeAt(0));
			this.writeChars(chars, 0, chars.length);
		}
	}

	writeLine(value: string | undefined): void {
		if (value !== undefined) {
			this.writeString(value);
		}
		this.writeString('\n');
	}
}
