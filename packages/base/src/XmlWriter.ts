import { IDisposable } from './IDisposable';
import { TextWriter } from './TextWriter';
import { XmlWriterSettings } from './XmlWriterSettings';

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriter.cs,0e895831d26a6aee,references
// Specifies the state of the XmlWriter.
export enum WriteState {
	// Nothing has been written yet.
	Start,
	// Writing the prolog.
	Prolog,
	// Writing a the start tag for an element.
	Element,
	// Writing an attribute value.
	Attribute,
	// Writing element content.
	Content,
	// XmlWriter is closed; Close has been called.
	Closed,
	// Writer is in error state.
	Error,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriter.cs,e5032b905808fabc,references
export abstract class XmlWriter implements IDisposable {
	// Creates an XmlWriter for writing into the provided TextWriter with the specified settings.
	static create(
		output: TextWriter,
		settings: XmlWriterSettings | undefined,
	): XmlWriter {
		settings ??= XmlWriterSettings.defaultWriterSettings;
		return settings.createWriter(output);
	}

	abstract writeStartDocument(): void;

	abstract writeEndDocument(): void;

	abstract writeStartElement(
		prefix: string | undefined,
		localName: string,
		ns: string | undefined,
	): void;

	abstract writeEndElement(): void;

	abstract writeFullEndElement(): void;

	abstract writeStartAttribute(
		prefix: string | undefined,
		localName: string,
		ns: string | undefined,
	): void;

	abstract writeEndAttribute(): void;

	writeAttributeString(
		prefix: string | undefined,
		localName: string,
		ns: string | undefined,
		value: string | undefined,
	): void {
		this.writeStartAttribute(prefix, localName, ns);
		this.writeString(value);
		this.writeEndAttribute();
	}

	abstract writeCData(text: string | undefined): void;

	abstract writeComment(text: string | undefined): void;

	abstract writeWhitespace(ws: string | undefined): void;

	abstract writeString(text: string | undefined): void;

	// Returns the state of the XmlWriter.
	abstract get writeState(): WriteState;

	// Closes the XmlWriter and the underlying stream/TextReader (if Settings.CloseOutput is true).
	close(): void {}

	// Flushes data that is in the internal buffers into the underlying streams/TextReader and flushes the stream/TextReader.
	abstract flush(): void;

	// Dispose the underline stream objects (calls Close on the XmlWriter)
	dispose(): void {
		if (this.writeState !== WriteState.Closed) {
			this.close();
		}
	}
}
