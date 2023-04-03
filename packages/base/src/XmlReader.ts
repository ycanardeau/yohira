import { IDisposable } from './IDisposable';
import { TextReader } from './TextReader';
import { XmlNodeType } from './XmlNodeType';
import { XmlReaderSettings } from './XmlReaderSettings';

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/ReadState.cs,aa34e54fa5d9e054,references
// Specifies the state of the XmlReader.
export enum ReadState {
	// The Read method has not been called yet.
	Initial = 0,
	// Reading is in progress.
	Interactive = 1,
	// An error occurred that prevents the XmlReader from continuing.
	Error = 2,
	// The end of the stream has been reached successfully.
	EndOfFile = 3,
	// The Close method has been called and the XmlReader is closed.
	Closed = 4,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlReader.cs,086471e5cca0825f,references
export abstract class XmlReader implements IDisposable {
	static readonly defaultBufferSize = 4096;

	// Chosen to be small enough that the character buffer in XmlTextReader when using Async = true
	// is not allocated on the Large Object Heap (LOH)
	static readonly asyncBufferSize = 32 * 1024;

	static create(
		input: TextReader,
		settings: XmlReaderSettings | undefined,
		baseUri?: string,
	): XmlReader {
		settings ??= XmlReaderSettings.defaultReaderSettings;
		return settings.createReader(input, baseUri /* TODO: , undefined */);
	}

	// Node Properties
	// Get the type of the current node.
	abstract get nodeType(): XmlNodeType;

	// Gets the name of the current node without the namespace prefix.
	abstract get localName(): string;

	// Gets the namespace URN (as defined in the W3C Namespace Specification) of the current namespace scope.
	abstract get namespaceURI(): string;

	// Gets the namespace prefix associated with the current node.
	abstract get prefix(): string;

	// Gets the text value of the current node.
	abstract get value(): string;

	// Gets a value indicating whether the current node is an empty element (for example, <MyElement/>).
	abstract get isEmptyElement(): boolean;

	// Moves to the first attribute of the current node.
	abstract moveToFirstAttribute(): boolean;

	// Moves to the next attribute.
	abstract moveToNextAttribute(): boolean;

	// Moves to the element that contains the current attribute node.
	abstract moveToElement(): boolean;

	abstract read(): boolean;

	// Returns true when the XmlReader is positioned at the end of the stream.
	abstract get eof(): boolean;

	// Returns the read state of the XmlReader.
	abstract get readState(): ReadState;

	moveToContent(): XmlNodeType {
		do {
			switch (this.nodeType) {
				case XmlNodeType.Attribute:
					this.moveToElement();
					return this.nodeType;
				case XmlNodeType.Element:
				case XmlNodeType.EndElement:
				case XmlNodeType.CDATA:
				case XmlNodeType.Text:
				case XmlNodeType.EntityReference:
				case XmlNodeType.EndEntity:
					return this.nodeType;
			}
		} while (this.read());
		return this.nodeType;
	}

	dispose(): void {
		// TODO
		//throw new Error('Method not implemented.');
	}
}
