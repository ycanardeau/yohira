import { IDisposable } from './IDisposable';
import { StringBuilder } from './StringBuilder';
import { TextWriter } from './TextWriter';
import {
	isAttributeValueChar,
	isNCNameSingleChar,
	isStartNCNameSingleChar,
	isSurrogate,
	isTextChar,
	surHighStart,
} from './XmlCharType';
import { XmlError } from './XmlError';
import { XmlReservedNs } from './XmlReservedNs';
import { XmlSpace } from './XmlSpace';

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/NamespaceHandling.cs,e4310df963ff2e7c,references
export enum NamespaceHandling {
	//
	// Default behavior
	//
	Default = 0x0,
	//
	// Duplicate namespace declarations will be removed
	//
	OmitDuplicates = 0x1,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriterSettings.cs,a303dd5ace0c84e7,references
enum XmlOutputMethod {
	Xml = 0, // Use Xml 1.0 rules to serialize
	Html = 1, // Use Html rules specified by Xslt specification to serialize
	Text = 2, // Only serialize text blocks
	AutoDetect = 3, // Choose between Xml and Html output methods at runtime (using Xslt rules to do so)
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriterSettings.cs,433cb2f7bb17fe95,references
/**
 * Three-state logic enumeration.
 */
enum TriState {
	Unknown = -1,
	False = 0,
	True = 1,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriterSettings.cs,3e876ef4a0935e86,references
export enum XmlStandalone {
	// Do not change the constants - XmlBinaryWriter depends in it
	Omit = 0,
	Yes = 1,
	No = 2,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/ConformanceLevel.cs,9282f93eb4403e2b,references
export enum ConformanceLevel {
	// With conformance level Auto an XmlReader or XmlWriter automatically determines whether in incoming XML is an XML fragment or document.
	Auto = 0,
	// Conformance level for XML fragment. An XML fragment can contain any node type that can be a child of an element,
	// plus it can have a single XML declaration as its first node
	Fragment = 1,
	// Conformance level for XML document as specified in XML 1.0 Specification
	Document = 2,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriterSettings.cs,ff9751984c5b1c38,references
export class XmlWriterSettings {
	/** @internal */ static readonly defaultWriterSettings =
		((): XmlWriterSettings => {
			const settings = new XmlWriterSettings();
			settings.readOnly = true;
			return settings;
		})();

	private _omitXmlDecl = false;
	private _closeOutput = false;
	private _namespaceHandling = NamespaceHandling.Default;
	private _conformanceLevel = ConformanceLevel.Document;
	private _writeEndDocumentOnClose = false;

	/** @internal */ indentInternal = TriState.Unknown;

	// Specifies the method (Html, Xml, etc.) that will be used to serialize the result tree.
	outputMethod = XmlOutputMethod.Xml;

	private initialize(): void {
		this.indentInternal = TriState.Unknown;
		this._namespaceHandling = NamespaceHandling.Default;
		this._conformanceLevel = ConformanceLevel.Document;
		this.outputMethod = XmlOutputMethod.Xml;
	}

	constructor() {
		this.initialize();
	}

	/** @internal */ readOnly = false;

	private checkReadOnly(propertyName: string): void {
		if (this.readOnly) {
			throw new XmlError(
				`The 'XmlWriterSettings.${propertyName}' property is read only and cannot be set.` /* LOC */,
			);
		}
	}

	get omitXmlDeclaration(): boolean {
		return this._omitXmlDecl;
	}
	set omitXmlDeclaration(value: boolean) {
		this.checkReadOnly('omitXmlDeclaration');
		this._omitXmlDecl = value;
	}

	get indent(): boolean {
		return this.indentInternal === TriState.True;
	}
	set indent(value: boolean) {
		this.checkReadOnly('indent');
		this.indentInternal = value ? TriState.True : TriState.False;
	}

	// Whether or not the XmlWriter should close the underlying stream or TextWriter when Close is called on the XmlWriter.
	get closeOutput(): boolean {
		return this._closeOutput;
	}
	set closeOutput(value: boolean) {
		this.checkReadOnly('closeOutput');
		this._closeOutput = value;
	}

	// Conformance
	// See ConformanceLevel enum for details.
	get conformanceLevel(): ConformanceLevel {
		return this._conformanceLevel;
	}
	set conformanceLevel(value: ConformanceLevel) {
		this.checkReadOnly('conformanceLevel');

		if (value > ConformanceLevel.Document) {
			throw new Error(
				'Specified argument was out of the range of valid values.' /* LOC */,
			);
		}
		this._conformanceLevel = value;
	}

	// Whether or not to remove duplicate namespace declarations
	get namespaceHandling(): NamespaceHandling {
		return this._namespaceHandling;
	}
	set namespaceHandling(value: NamespaceHandling) {
		this.checkReadOnly('namespaceHandling');
		// TODO
		this._namespaceHandling = value;
	}

	//Whether or not to auto complete end-element when close/dispose
	get writeEndDocumentOnClose(): boolean {
		return this._writeEndDocumentOnClose;
	}
	set writeEndDocumentOnClose(value: boolean) {
		this.checkReadOnly('writeEndDocumentOnClose');
		this._writeEndDocumentOnClose = value;
	}

	/** @internal */ createWriter(output: TextWriter): XmlWriter {
		let writer: XmlWriter;

		switch (this.outputMethod) {
			case XmlOutputMethod.Xml:
				writer = this.indent
					? new XmlEncodedRawTextWriterIndent(output, this)
					: new XmlEncodedRawTextWriter(output, this);
				break;
			case XmlOutputMethod.Html:
				// TODO
				throw new Error('Method not implemented.');
			case XmlOutputMethod.Text:
				// TODO
				throw new Error('Method not implemented.');
			case XmlOutputMethod.AutoDetect:
				// TODO
				throw new Error('Method not implemented.');
			default:
				throw new Error('Invalid XmlOutputMethod setting.');
		}

		// TODO

		// wrap with well-formed writer
		writer = new XmlWellFormedWriter(writer, this);

		// TODO
		return writer;
	}
}

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

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlRawWriter.cs,0fee6820237b2b99,references
export abstract class XmlRawWriter extends XmlWriter {
	/** @internal */ get supportsNamespaceDeclarationInChunks(): boolean {
		return false;
	}

	/** @internal */ writeXmlDeclaration(standalone: XmlStandalone): void {}

	// Called after an element's attributes have been enumerated, but before any children have been
	// enumerated.  This method must always be called, even for empty elements.
	/** @internal */ abstract startElementContent(): void;

	// Called before a root element is written (before the WriteStartElement call)
	//   the conformanceLevel specifies the current conformance level the writer is operating with.
	/** @internal */ onRootElement(conformancelevel: ConformanceLevel): void {}

	// This method must be called instead of WriteStartAttribute() for namespaces.
	/** @internal */ abstract writeNamespaceDeclaration(
		prefix: string,
		ns: string,
	): void;

	// Raw writers do not have to keep a stack of element names.
	writeEndElement(): void {
		throw new Error(
			'Operation is not valid due to the current state of the object.' /* LOC */,
		);
	}

	// Raw writers do not have to keep a stack of element names.
	writeFullEndElement(): void {
		throw new Error(
			'Operation is not valid due to the current state of the object.' /* LOC */,
		);
	}

	/** @internal */ abstract writeEndElementWithFullName(
		prefix: string,
		localName: string,
		ns: string,
	): void;

	/** @internal */ writeFullEndElementWithFullName(
		prefix: string,
		localName: string,
		ns: string,
	): void {
		this.writeEndElementWithFullName(prefix, localName, ns);
	}

	// Raw writers do not have to keep track of write states.
	get writeState(): WriteState {
		throw new Error(
			'Operation is not valid due to the current state of the object.' /* LOC */,
		);
	}

	// This is called when the remainder of a base64 value should be output.
	/** @internal */ writeEndBase64(): void {
		// The Flush will call WriteRaw to write out the rest of the encoded characters
		// TODO
		throw new Error('Method not implemented.');
	}

	/** @internal */ closeWithWriteState(currentState: WriteState): void {
		this.close();
	}
}

//
// Constants
//
const BUFSIZE = 2048 * 3; // Should be greater than default FileStream size (4096), otherwise the FileStream will try to cache the data
const OVERFLOW = 32; // Allow overflow in order to reduce checks when writing out constant size markup

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlEncodedRawTextWriter.cs,93862eb7e8e01c25,references
// Concrete implementation of XmlWriter abstract class that serializes events as encoded XML
// text.  The general-purpose XmlEncodedTextWriter uses the Encoder class to output to any
// encoding.  The XmlUtf8TextWriter class combined the encoding operation with serialization
// in order to achieve better performance.
export class XmlEncodedRawTextWriter extends XmlRawWriter {
	// buffer positions
	protected bufPos = 1; // buffer position starts at 1, because we need to be able to safely step back -1 in case we need to
	// close an empty element or in CDATA section detection of double ]; _bufChars[0] will always be 0
	protected textPos = 1; // text end position; don't indent first element, pi, or comment
	protected contentPos = 0; // element content end position
	protected cdataPos = 0; // cdata end position
	protected attrEndPos = 0; // end of the last attribute
	protected bufLen = BUFSIZE;

	// flags
	protected writeToNull = false;
	protected inAttributeValue = false;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	protected bufChars: number[] = undefined!;

	// output text writer
	protected writer?: TextWriter;

	// escaping of characters invalid in the output encoding
	protected trackTextContent = false;
	protected inTextContent = false;
	private lastMarkPos = 0;
	private textContentMarks?: number[]; // even indices contain text content start positions
	// odd indices contain markup start positions

	// writer settings
	protected closeOutput: boolean;
	protected omitXmlDeclaration: boolean;

	protected autoXmlDeclaration = false;

	// Construct an instance of this class that outputs text to the TextWriter interface.
	constructor(writer: TextWriter, settings: XmlWriterSettings) {
		super();

		// copy settings
		// TODO
		this.omitXmlDeclaration = settings.omitXmlDeclaration;
		// TODO
		this.closeOutput = settings.closeOutput;

		if (writer === undefined || settings === undefined) {
			throw new Error('Assertion failed.');
		}

		this.writer = writer;
		// TODO
		this.bufChars = new Array(this.bufLen + OVERFLOW);
	}

	// Write the xml declaration.  This must be the first call.
	/** @internal */ writeXmlDeclaration(standalone: XmlStandalone): void {
		// Output xml declaration only if user allows it and it was not already output
		if (!this.omitXmlDeclaration && !this.autoXmlDeclaration) {
			if (this.trackTextContent && this.inTextContent) {
				this.changeTextContentMark(false);
			}
			this.rawText('<?xml version="');

			// Version
			this.rawText('1.0');

			// Encoding
			/* TODO: if (this.encoding !== undefined) {
				this.rawText('" encoding="');
				this.rawText(this.encoding.name);
			} */

			// Standalone
			if (standalone !== XmlStandalone.Omit) {
				this.rawText('" standalone="');
				this.rawText(standalone === XmlStandalone.Yes ? 'yes' : 'no');
			}

			this.rawText('"?>');
		}
	}

	writeStartDocument(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	writeEndDocument(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	private growTextContentMarks(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	protected changeTextContentMark(value: boolean): void {
		if (this.inTextContent === value) {
			throw new Error('Assertion failed.');
		}
		if (!this.inTextContent && (this.lastMarkPos & 1) !== 0) {
			throw new Error('Assertion failed.');
		}
		this.inTextContent = value;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (this.lastMarkPos + 1 === this.textContentMarks!.length) {
			this.growTextContentMarks();
		}
		this.textContentMarks![++this.lastMarkPos] = this.bufPos;
	}

	//
	// Implementation methods
	//
	// Flush all characters in the buffer to output.  Do not flush the output object.
	protected flushBuffer(): void {
		try {
			// Output all characters (except for previous characters stored at beginning of buffer)
			if (!this.writeToNull) {
				if (true /* TODO */ && this.writer === undefined) {
					throw new Error('Assertion failed.');
				}

				if (false /* TODO */) {
					// TODO
					throw new Error('Method not implemented.');
				} else {
					if (this.bufPos - 1 > 0) {
						// Write text to TextWriter
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						this.writer!.writeChars(
							this.bufChars,
							1,
							this.bufPos - 1,
						);
					}
				}
			}
		} catch (error) {
			// Future calls to flush (i.e. when Close() is called) don't attempt to write to stream
			this.writeToNull = true;
			throw error;
		} finally {
			// Move last buffer character to the beginning of the buffer (so that previous character can always be determined)
			this.bufChars[0] = this.bufChars[this.bufPos - 1];

			// Reset buffer position
			this.textPos = this.textPos === this.bufPos ? 1 : 0;
			this.attrEndPos = this.attrEndPos === this.bufPos ? 1 : 0;
			this.contentPos = 0; // Needs to be zero, since overwriting '>' character is no longer possible
			this.cdataPos = 0; // Needs to be zero, since overwriting ']]>' characters is no longer possible
			this.bufPos = 1; // Buffer position starts at 1, because we need to be able to safely step back -1 in case we need to
			// close an empty element or in CDATA section detection of double ]; _bufChars[0] will always be 0
		}
	}

	private static encodeSurrogate(
		pSrc: number,
		pSrcEnd: number,
		pDst: number,
	): number {
		// TODO
		throw new Error('Method not implemented.');
	}

	private static invalidXmlChar(
		ch: number,
		pDst: number,
		entitize: boolean,
	): number {
		// TODO
		throw new Error('Method not implemented.');
	}

	// OPTIMIZE
	protected rawText(s: string): void {
		if (s === undefined) {
			throw new Error('Assertion failed.');
		}

		const pDstBegin = 0;
		const pSrcBegin = 0;
		const pSrcEnd = s.length;
		let pDst = pDstBegin + this.bufPos;
		let pSrc = pSrcBegin;

		let ch = 0;
		while (true) {
			let pDstEnd = pDst + (pSrcEnd - pSrc);
			if (pDstEnd > pDstBegin + this.bufLen) {
				pDstEnd = pDstBegin + this.bufLen;
			}

			while (pDst < pDstEnd && (ch = s.charCodeAt(pSrc)) < surHighStart) {
				pSrc++;
				this.bufChars[pDst] = ch;
				pDst++;
			}
			if (pSrc > pSrcEnd) {
				throw new Error('Assertion failed.');
			}

			// end of value
			if (pSrc >= pSrcEnd) {
				break;
			}

			// end of buffer
			if (pDst >= pDstEnd) {
				this.bufPos = pDst - pDstBegin;
				this.flushBuffer();
				pDst = pDstBegin + 1;
				continue;
			}

			// Surrogate character
			if (isSurrogate(ch)) {
				pDst = XmlEncodedRawTextWriter.encodeSurrogate(
					pSrc,
					pSrcEnd,
					pDst,
				);
				pSrc += 2;
			}
			// Invalid XML character
			else if (ch <= 0x7f || ch >= 0xfffe) {
				pDst = XmlEncodedRawTextWriter.invalidXmlChar(ch, pDst, false);
				pSrc++;
			}
			// Other character between SurLowEnd and 0xFFFE
			else {
				this.bufChars[pDst] = ch;
				pDst++;
				pSrc++;
			}
		}

		this.bufPos = pDst - pDstBegin;
	}

	// Serialize the beginning of an element start tag: "<prefix:localName"
	writeStartElement(
		prefix: string | undefined,
		localName: string,
		ns: string | undefined,
	): void {
		if (localName === undefined || localName.length <= 0) {
			throw new Error('Assertion failed.');
		}
		if (prefix === undefined) {
			throw new Error('Assertion failed.');
		}

		if (this.trackTextContent && this.inTextContent) {
			this.changeTextContentMark(false);
		}

		this.bufChars[this.bufPos++] = '<'.charCodeAt(0);
		if (prefix !== undefined && prefix.length !== 0) {
			this.rawText(prefix);
			this.bufChars[this.bufPos++] = ':'.charCodeAt(0);
		}

		this.rawText(localName);

		this.attrEndPos = this.bufPos;
	}

	// Serialize an element end tag: "</prefix:localName>", if content was output.  Otherwise, serialize
	// the shortcut syntax: " />".
	/** @internal */ writeEndElementWithFullName(
		prefix: string,
		localName: string,
		ns: string,
	): void {
		if (localName === undefined || localName.length <= 0) {
			throw new Error('Assertion failed.');
		}
		if (prefix === undefined) {
			throw new Error('Assertion failed.');
		}

		if (this.trackTextContent && this.inTextContent) {
			this.changeTextContentMark(false);
		}

		if (this.contentPos !== this.bufPos) {
			// Content has been output, so can't use shortcut syntax
			this.bufChars[this.bufPos++] = '<'.charCodeAt(0);
			this.bufChars[this.bufPos++] = '/'.charCodeAt(0);

			if (prefix !== undefined && prefix.length !== 0) {
				this.rawText(prefix);
				this.bufChars[this.bufPos++] = ':'.charCodeAt(0);
			}
			this.rawText(localName);
			this.bufChars[this.bufPos++] = '>'.charCodeAt(0);
		} else {
			// Use shortcut syntax; overwrite the already output '>' character
			this.bufPos--;
			this.bufChars[this.bufPos++] = ' '.charCodeAt(0);
			this.bufChars[this.bufPos++] = '/'.charCodeAt(0);
			this.bufChars[this.bufPos++] = '>'.charCodeAt(0);
		}
	}

	// Serialize a full element end tag: "</prefix:localName>"
	/** @internal */ writeFullEndElementWithFullName(
		prefix: string,
		localName: string,
		ns: string,
	): void {
		if (localName === undefined || localName.length <= 0) {
			throw new Error('Assertion failed.');
		}
		if (prefix === undefined) {
			throw new Error('Assertion failed.');
		}

		if (this.trackTextContent && this.inTextContent) {
			this.changeTextContentMark(false);
		}

		this.bufChars[this.bufPos++] = '<'.charCodeAt(0);
		this.bufChars[this.bufPos++] = '/'.charCodeAt(0);

		if (prefix !== undefined && prefix.length !== 0) {
			this.rawText(prefix);
			this.bufChars[this.bufPos++] = ':'.charCodeAt(0);
		}
		this.rawText(localName);
		this.bufChars[this.bufPos++] = '>'.charCodeAt(0);
	}

	// Serialize an attribute tag using double quotes around the attribute value: 'prefix:localName="'
	writeStartAttribute(
		prefix: string | undefined,
		localName: string,
		ns: string | undefined,
	): void {
		if (localName === undefined || localName.length <= 0) {
			throw new Error('Assertion failed.');
		}
		if (prefix === undefined) {
			throw new Error('Assertion failed.');
		}

		if (this.trackTextContent && this.inTextContent) {
			this.changeTextContentMark(false);
		}

		if (this.attrEndPos === this.bufPos) {
			this.bufChars[this.bufPos++] = ' '.charCodeAt(0);
		}

		if (prefix !== undefined && prefix.length > 0) {
			this.rawText(prefix);
			this.bufChars[this.bufPos++] = ':'.charCodeAt(0);
		}
		this.rawText(localName);
		this.bufChars[this.bufPos++] = '='.charCodeAt(0);
		this.bufChars[this.bufPos++] = '"'.charCodeAt(0);

		this.inAttributeValue = true;
	}

	// Serialize the end of an attribute value using double quotes: '"'
	writeEndAttribute(): void {
		if (this.trackTextContent && this.inTextContent) {
			this.changeTextContentMark(false);
		}

		this.bufChars[this.bufPos++] = '"'.charCodeAt(0);
		this.inAttributeValue = false;
		this.attrEndPos = this.bufPos;
	}

	writeCData(text: string | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	protected writeCommentOrPi(text: string, stopChar: number): void {
		if (text.length === 0) {
			if (this.bufPos > this.bufLen) {
				this.flushBuffer();
			}
			return;
		}
		// write text
		const pSrcBegin = 0;

		const pDstBegin = 0;
		let pSrc = pSrcBegin;

		const pSrcEnd = pSrcBegin + text.length;

		let pDst = pDstBegin + this.bufPos;

		let ch = 0;
		while (true) {
			let pDstEnd = pDst + (pSrcEnd - pSrc);
			if (pDstEnd > pDstBegin + this.bufLen) {
				pDstEnd = pDstBegin + this.bufLen;
			}

			while (
				pDst < pDstEnd &&
				isTextChar((ch = text.charCodeAt(pSrc))) &&
				ch !== stopChar
			) {
				this.bufChars[pDst] = ch;
				pDst++;
				pSrc++;
			}

			if (pSrc > pSrcEnd) {
				throw new Error('Assertion failed.');
			}

			// end of value
			if (pSrc >= pSrcEnd) {
				break;
			}

			// end of buffer
			if (pDst >= pDstEnd) {
				this.bufPos = pDst - pDstBegin;
				this.flushBuffer();
				pDst = pDstBegin + 1;
				continue;
			}

			// handle special characters
			switch (ch) {
				case '-'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case '?'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case ']'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case 0xd:
					// TODO
					throw new Error('Method not implemented.');
				case 0xa:
					// TODO
					throw new Error('Method not implemented.');
				case '<'.charCodeAt(0):
				case '&'.charCodeAt(0):
				case 0x9:
					// TODO
					throw new Error('Method not implemented.');
				default:
					// Surrogate character
					if (isSurrogate(ch)) {
						pDst = XmlEncodedRawTextWriter.encodeSurrogate(
							pSrc,
							pSrcEnd,
							pDst,
						);
						pSrc += 2;
					}
					// Invalid XML character
					else if (ch <= 0x7f || ch >= 0xfffe) {
						pDst = XmlEncodedRawTextWriter.invalidXmlChar(
							ch,
							pDst,
							false,
						);
						pSrc++;
					}
					// Other character between SurLowEnd and 0xFFFE
					else {
						this.bufChars[pDst] = ch;
						pDst++;
						pSrc++;
					}
					continue;
			}
			pSrc++;
		}
		this.bufPos = pDst - pDstBegin;
	}

	// Serialize a comment.
	writeComment(text: string | undefined): void {
		if (text === undefined) {
			throw new Error('Assertion failed.');
		}

		if (this.trackTextContent && this.inTextContent) {
			this.changeTextContentMark(false);
		}

		this.bufChars[this.bufPos++] = '<'.charCodeAt(0);
		this.bufChars[this.bufPos++] = '!'.charCodeAt(0);
		this.bufChars[this.bufPos++] = '-'.charCodeAt(0);
		this.bufChars[this.bufPos++] = '-'.charCodeAt(0);

		this.writeCommentOrPi(text, '-'.charCodeAt(0));

		this.bufChars[this.bufPos++] = '-'.charCodeAt(0);
		this.bufChars[this.bufPos++] = '-'.charCodeAt(0);
		this.bufChars[this.bufPos++] = '>'.charCodeAt(0);
	}

	writeWhitespace(ws: string | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	// Serialize text that is part of an attribute value.  The '&', '<', '>', and '"' characters
	// are entitized.
	protected writeAttributeTextBlock(
		src: string,
		pSrc: number,
		pSrcEnd: number,
	): void {
		const pDstBegin = 0;
		let pDst = pDstBegin + this.bufPos;

		let ch = 0;
		while (true) {
			let pDstEnd = pDst + (pSrcEnd - pSrc);
			if (pDstEnd > pDstBegin + this.bufLen) {
				pDstEnd = pDstBegin + this.bufLen;
			}

			while (
				pDst < pDstEnd &&
				isAttributeValueChar((ch = src.charCodeAt(pSrc)))
			) {
				this.bufChars[pDst] = ch;
				pDst++;
				pSrc++;
			}

			if (pSrc > pSrcEnd) {
				throw new Error('Assertion failed.');
			}

			// end of value
			if (pSrc >= pSrcEnd) {
				break;
			}

			// end of buffer
			if (pDst >= pDstEnd) {
				this.bufPos = pDst - pDstBegin;
				this.flushBuffer();
				pDst = pDstBegin + 1;
				continue;
			}

			// some character needs to be escaped
			switch (ch) {
				case '&'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case '<'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case '>'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case '"'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case "'".charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case 0x9:
					// TODO
					throw new Error('Method not implemented.');
				case 0xd:
					// TODO
					throw new Error('Method not implemented.');
				case 0xa:
					// TODO
					throw new Error('Method not implemented.');
				default:
					// TODO
					throw new Error('Method not implemented.');
			}
			pSrc++;
		}
		this.bufPos = pDst - pDstBegin;
	}

	// Serialize text that is part of element content.  The '&', '<', and '>' characters
	// are entitized.
	protected writeElementTextBlock(
		src: string,
		pSrc: number,
		pSrcEnd: number,
	): void {
		const pDstBegin = 0;
		let pDst = pDstBegin + this.bufPos;

		let ch = 0;
		while (true) {
			let pDstEnd = pDst + (pSrcEnd - pSrc);
			if (pDstEnd > pDstBegin + this.bufLen) {
				pDstEnd = pDstBegin + this.bufLen;
			}

			while (
				pDst < pDstEnd &&
				isAttributeValueChar((ch = src.charCodeAt(pSrc)))
			) {
				this.bufChars[pDst] = ch;
				pDst++;
				pSrc++;
			}
			if (pSrc > pSrcEnd) {
				throw new Error('Assertion failed.');
			}

			// end of value
			if (pSrc >= pSrcEnd) {
				break;
			}

			// end of buffer
			if (pDst >= pDstEnd) {
				this.bufPos = pDst - pDstBegin;
				this.flushBuffer();
				pDst = pDstBegin + 1;
				continue;
			}

			// some character needs to be escaped
			switch (ch) {
				case '&'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case '<'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case '>'.charCodeAt(0):
					// TODO
					throw new Error('Method not implemented.');
				case '"'.charCodeAt(0):
				case "'".charCodeAt(0):
				case 0x9:
					// TODO
					throw new Error('Method not implemented.');
				case 0xa:
					// TODO
					throw new Error('Method not implemented.');
				case 0xd:
					// TODO
					throw new Error('Method not implemented.');
				default:
					// TODO
					throw new Error('Method not implemented.');
			}
			pSrc++;
		}
		this.bufPos = pDst - pDstBegin;
		this.textPos = this.bufPos;
		this.contentPos = 0;
	}

	// Serialize either attribute or element text using XML rules.
	writeString(text: string | undefined): void {
		if (text === undefined) {
			throw new Error('Assertion failed.');
		}

		if (this.trackTextContent && this.inTextContent !== true) {
			this.changeTextContentMark(true);
		}

		if (this.inAttributeValue) {
			this.writeAttributeTextBlock(text, 0, text.length);
		} else {
			this.writeElementTextBlock(text, 0, text.length);
		}
	}

	// Serialize the end of an element start tag in preparation for content serialization: ">"
	startElementContent(): void {
		this.bufChars[this.bufPos++] = '>'.charCodeAt(0);

		// StartElementContent is always called; therefore, in order to allow shortcut syntax, we save the
		// position of the '>' character.  If WriteEndElement is called and no other characters have been
		// output, then the '>' character can be overwritten with the shortcut syntax " />".
		this.contentPos = this.bufPos;
	}

	/** @internal */ writeStartNamespaceDeclaration(prefix: string): void {
		if (prefix === undefined) {
			throw new Error('Assertion failed.');
		}

		if (this.trackTextContent && this.inTextContent) {
			this.changeTextContentMark(false);
		}

		if (this.attrEndPos === this.bufPos) {
			this.bufChars[this.bufPos++] = ' '.charCodeAt(0);
		}

		if (prefix.length === 0) {
			this.rawText('xmlns="');
		} else {
			this.rawText('xmlns:');
			this.rawText(prefix);
			this.bufChars[this.bufPos++] = '='.charCodeAt(0);
			this.bufChars[this.bufPos++] = '"'.charCodeAt(0);
		}

		this.inAttributeValue = true;

		if (this.trackTextContent && this.inTextContent !== true) {
			this.changeTextContentMark(true);
		}
	}

	/** @internal */ writeEndNamespaceDeclaration(): void {
		if (this.trackTextContent && this.inTextContent) {
			this.changeTextContentMark(false);
		}
		this.inAttributeValue = false;

		this.bufChars[this.bufPos++] = '"'.charCodeAt(0);
		this.attrEndPos = this.bufPos;
	}

	writeNamespaceDeclaration(prefix: string, namespaceName: string): void {
		if (prefix === undefined || namespaceName === undefined) {
			throw new Error('Assertion failed.');
		}

		this.writeStartNamespaceDeclaration(prefix);
		this.writeString(namespaceName);
		this.writeEndNamespaceDeclaration();
	}

	// Flush all bytes in the buffer to output and close the output stream or writer.
	close(): void {
		try {
			this.flushBuffer();
			this.flushEncoder();
		} finally {
			// Future calls to Close or Flush shouldn't write to Stream or Writer
			this.writeToNull = true;

			if (false /* TODO */) {
				// TODO
				throw new Error('Method not implemented.');
			} else if (this.writer !== undefined) {
				try {
					this.writer.flush();
				} finally {
					try {
						if (this.closeOutput) {
							this.writer.dispose();
						}
					} finally {
						this.writer = undefined;
					}
				}
			}
		}
	}

	private flushEncoder(): void {
		if (this.bufPos !== 1) {
			throw new Error('Assertion failed.');
		}
		if (false /* TODO */) {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	// Flush all characters in the buffer to output and call Flush() on the output object.
	flush(): void {
		this.flushBuffer();
		this.flushEncoder();

		if (false /* TODO */) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			this.writer?.flush();
		}
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlEncodedRawTextWriter.cs,39809ae8a53e5c35,references
// Same as base text writer class except that elements, attributes, comments, and pi's are indented.
export class XmlEncodedRawTextWriterIndent extends XmlEncodedRawTextWriter {
	// TODO: implement
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,734e9d291573ffed,references
class ElementScope {
	/** @internal */ prevNSTop = 0;
	/** @internal */ prefix: string = undefined!;
	/** @internal */ localName: string = undefined!;
	/** @internal */ namespaceUri: string = undefined!;
	/** @internal */ xmlSpace = XmlSpace.None;
	/** @internal */ xmlLang?: string;

	/** @internal */ set(
		prefix: string,
		localName: string,
		namespaceUri: string,
		prevNSTop: number,
	): void {
		this.prevNSTop = prevNSTop;
		this.prefix = prefix;
		this.namespaceUri = namespaceUri;
		this.localName = localName;
		this.xmlSpace = -1 as XmlSpace;
		this.xmlLang = undefined;
	}

	/** @internal */ writeEndElement(rawWriter: XmlRawWriter): void {
		rawWriter.writeEndElementWithFullName(
			this.prefix,
			this.localName,
			this.namespaceUri,
		);
	}

	/** @internal */ writeFullEndElement(rawWriter: XmlRawWriter): void {
		rawWriter.writeFullEndElementWithFullName(
			this.prefix,
			this.localName,
			this.namespaceUri,
		);
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,90c05124b644f384,references
enum NamespaceKind {
	Written,
	NeedToWrite,
	Implied,
	Special,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,8a7758aadb346d66
class Namespace {
	/** @internal */ prefix: string = undefined!;
	/** @internal */ namespaceUri: string = undefined!;
	/** @internal */ kind = NamespaceKind.Written;
	/** @internal */ prevNsIndex = 0;

	/** @internal */ set(
		prefix: string,
		namespaceUri: string,
		kind: NamespaceKind,
	): void {
		this.prefix = prefix;
		this.namespaceUri = namespaceUri;
		this.kind = kind;
		this.prevNsIndex = -1;
	}

	/** @internal */ writeDecl(
		writer: XmlWriter,
		rawWriter: XmlRawWriter | undefined,
	): void {
		if (this.kind !== NamespaceKind.NeedToWrite) {
			throw new Error('Assertion failed.');
		}
		if (rawWriter !== undefined) {
			rawWriter.writeNamespaceDeclaration(this.prefix, this.namespaceUri);
		} else {
			if (this.prefix.length === 0) {
				writer.writeStartAttribute('', 'xmlns', XmlReservedNs.NsXmlNs);
			} else {
				writer.writeStartAttribute(
					'xmlns',
					this.prefix,
					XmlReservedNs.NsXmlNs,
				);
			}

			writer.writeString(this.namespaceUri);
			writer.writeEndAttribute();
		}
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,98459c89f9f50423,references
class AttrName {
	/** @internal */ prefix: string = undefined!;
	/** @internal */ namespaceUri: string = undefined!;
	/** @internal */ localName: string = undefined!;
	/** @internal */ prev = 0;

	/** @internal */ set(
		prefix: string,
		localName: string,
		namespaceUri: string,
	): void {
		this.prefix = prefix;
		this.namespaceUri = namespaceUri;
		this.localName = localName;
		this.prev = 0;
	}

	/** @internal */ isDuplicate(
		prefix: string,
		localName: string,
		namespaceUri: string,
	): boolean {
		return (
			this.localName === localName &&
			(this.prefix === prefix || this.namespaceUri === namespaceUri)
		);
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,d9d8a72ee9f0daf6,references
enum SpecialAttribute {
	No = 0,
	DefaultXmlns,
	PrefixedXmlns,
	XmlSpace,
	XmlLang,
}

enum ItemType {
	EntityRef,
	CharEntity,
	SurrogateCharEntity,
	Whitespace,
	String,
	StringChars,
	Raw,
	RawChars,
	ValueString,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,d1d08de4980914bf,references
class AttributeValueCache {
	private _stringValue = new StringBuilder();
	private singleStringValue?: string; // special-case for a single WriteString call
	private firstItem = 0;
	private lastItem = -1;

	/** @internal */ get stringValue(): string {
		if (this.singleStringValue !== undefined) {
			return this.singleStringValue;
		} else {
			return this.stringValue.toString();
		}
	}

	private addItem(type: ItemType, data: string /* TODO: object */): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	/** @internal */ writeString(text: string): void {
		if (this.singleStringValue !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			// special-case for a single WriteString
			if (this.lastItem === -1) {
				this.singleStringValue = text;
				return;
			}
		}

		this._stringValue.appendString(text);
		this.addItem(ItemType.String, text);
	}

	/** @internal */ clear(): void {
		this.singleStringValue = undefined;
		this.lastItem = -1;
		this.firstItem = 0;
		this._stringValue.length = 0;
	}
}

//
// Constants
//
const elementStackInitialSize = 8;
const namespaceStackInitialSize = 8;
const attributeArrayInitialSize = 8;
const maxAttrDuplWalkCount = 14;
const maxNamespacesWalkCount = 16;

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriter.cs,b4a25faed8280ec6,references
//
// State tables
//
enum State {
	Start = 0,
	TopLevel = 1,
	Document = 2,
	Element = 3,
	Content = 4,
	B64Content = 5,
	B64Attribute = 6,
	AfterRootEle = 7,
	Attribute = 8,
	SpecialAttr = 9,
	EndDocument = 10,
	RootLevelAttr = 11,
	RootLevelSpecAttr = 12,
	RootLevelB64Attr = 13,
	AfterRootLevelAttr = 14,
	Closed = 15,
	Error = 16,

	StartContent = 101,
	StartContentEle = 102,
	StartContentB64 = 103,
	StartDoc = 104,
	StartDocEle = 106,
	EndAttrSEle = 107,
	EndAttrEEle = 108,
	EndAttrSCont = 109,
	EndAttrSAttr = 111,
	PostB64Cont = 112,
	PostB64Attr = 113,
	PostB64RootAttr = 114,
	StartFragEle = 115,
	StartFragCont = 116,
	StartFragB64 = 117,
	StartRootLevelAttr = 118,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriter.cs,f1620b9f280353b5,references
enum Token {
	StartDocument,
	EndDocument,
	PI,
	Comment,
	Dtd,
	StartElement,
	EndElement,
	StartAttribute,
	EndAttribute,
	Text,
	CData,
	AtomicValue,
	Base64,
	RawData,
	Whitespace,
}

const stateName = {
	[State.Start]: 'Start', // State.Start
	[State.TopLevel]: 'TopLevel', // State.TopLevel
	[State.Document]: 'Document', // State.Document
	[State.Element]: 'Element Start Tag', // State.Element
	[State.Content]: 'Element Content', // State.Content
	[State.B64Content]: 'Element Content', // State.B64Content
	[State.B64Attribute]: 'Attribute', // State.B64Attribute
	[State.AfterRootEle]: 'EndRootElement', // State.AfterRootEle
	[State.Attribute]: 'Attribute', // State.Attribute
	[State.SpecialAttr]: 'Special Attribute', // State.SpecialAttr
	[State.EndDocument]: 'End Document', // State.EndDocument
	[State.RootLevelAttr]: 'Root Level Attribute Value', // State.RootLevelAttr
	[State.RootLevelSpecAttr]: 'Root Level Special Attribute Value', // State.RootLevelSpecAttr
	[State.RootLevelB64Attr]: 'Root Level Base64 Attribute Value', // State.RootLevelB64Attr
	[State.AfterRootLevelAttr]: 'After Root Level Attribute', // State.AfterRootLevelAttr
	[State.Closed]: 'Closed', // State.Closed
	[State.Error]: 'Error', // State.Error
} as const;

const tokenName = {
	[Token.StartDocument]: 'StartDocument', // Token.StartDocument
	[Token.EndDocument]: 'EndDocument', // Token.EndDocument
	[Token.PI]: 'PI', // Token.PI
	[Token.Comment]: 'Comment', // Token.Comment
	[Token.Dtd]: 'DTD', // Token.Dtd
	[Token.StartElement]: 'StartElement', // Token.StartElement
	[Token.EndElement]: 'EndElement', // Token.EndElement
	[Token.StartAttribute]: 'StartAttribute', // Token.StartAttribut
	[Token.EndAttribute]: 'EndAttribute', // Token.EndAttribute
	[Token.Text]: 'Text', // Token.Text
	[Token.CData]: 'CDATA', // Token.CData
	[Token.AtomicValue]: 'Atomic value', // Token.AtomicValue
	[Token.Base64]: 'Base64', // Token.Base64
	[Token.RawData]: 'RawData', // Token.RawData
	[Token.Whitespace]: 'Whitespace', // Token.Whitespace
} as const;

const state2WriteState = {
	[State.Start]: WriteState.Start, // State.Start
	[State.TopLevel]: WriteState.Prolog, // State.TopLevel
	[State.Document]: WriteState.Prolog, // State.Document
	[State.Element]: WriteState.Element, // State.Element
	[State.Content]: WriteState.Content, // State.Content
	[State.B64Content]: WriteState.Content, // State.B64Content
	[State.B64Attribute]: WriteState.Attribute, // State.B64Attribute
	[State.AfterRootEle]: WriteState.Content, // State.AfterRootEle
	[State.Attribute]: WriteState.Attribute, // State.Attribute
	[State.SpecialAttr]: WriteState.Attribute, // State.SpecialAttr
	[State.EndDocument]: WriteState.Content, // State.EndDocument
	[State.RootLevelAttr]: WriteState.Attribute, // State.RootLevelAttr
	[State.RootLevelSpecAttr]: WriteState.Attribute, // State.RootLevelSpecAttr
	[State.RootLevelB64Attr]: WriteState.Attribute, // State.RootLevelB64Attr
	[State.AfterRootLevelAttr]: WriteState.Attribute, // State.AfterRootLevelAttr
	[State.Closed]: WriteState.Closed, // State.Closed
	[State.Error]: WriteState.Error, // State.Error
} as const;

const stateTableDocument = [
	//                         State.Start           State.TopLevel   State.Document     State.Element          State.Content     State.B64Content      State.B64Attribute   State.AfterRootEle    State.Attribute,      State.SpecialAttr,   State.EndDocument,  State.RootLevelAttr,      State.RootLevelSpecAttr,  State.RootLevelB64Attr   State.AfterRootLevelAttr, // 16
	/* Token.StartDocument  */ State.Document,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.EndDocument    */ State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.Error,
	State.EndDocument,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.PI             */ State.StartDoc,
	State.TopLevel,
	State.Document,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Comment        */ State.StartDoc,
	State.TopLevel,
	State.Document,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Dtd            */ State.StartDoc,
	State.TopLevel,
	State.Document,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.StartElement   */ State.StartDocEle,
	State.Element,
	State.Element,
	State.StartContentEle,
	State.Element,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrSEle,
	State.EndAttrSEle,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.EndElement     */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrEEle,
	State.EndAttrEEle,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.StartAttribute */ State.Error,
	State.Error,
	State.Error,
	State.Attribute,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrSAttr,
	State.EndAttrSAttr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.EndAttribute   */ State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Element,
	State.Element,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Text           */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.CData          */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.AtomicValue    */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Attribute,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Base64         */ State.Error,
	State.Error,
	State.Error,
	State.StartContentB64,
	State.B64Content,
	State.B64Content,
	State.B64Attribute,
	State.Error,
	State.B64Attribute,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.RawData        */ State.StartDoc,
	State.Error,
	State.Document,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Whitespace     */ State.StartDoc,
	State.TopLevel,
	State.Document,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
] as const;

const stateTableAuto = [
	//                         State.Start           State.TopLevel       State.Document     State.Element          State.Content     State.B64Content      State.B64Attribute   State.AfterRootEle    State.Attribute,      State.SpecialAttr,   State.EndDocument,  State.RootLevelAttr,      State.RootLevelSpecAttr,  State.RootLevelB64Attr,  State.AfterRootLevelAttr  // 16
	/* Token.StartDocument  */ State.Document,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.StartDocument  */,
	/* Token.EndDocument    */ State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.Error,
	State.EndDocument,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.EndDocument    */,
	/* Token.PI             */ State.TopLevel,
	State.TopLevel,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.PI             */,
	/* Token.Comment        */ State.TopLevel,
	State.TopLevel,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.Comment        */,
	/* Token.Dtd            */ State.StartDoc,
	State.TopLevel,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.Dtd            */,
	/* Token.StartElement   */ State.StartFragEle,
	State.Element,
	State.Error,
	State.StartContentEle,
	State.Element,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Element,
	State.EndAttrSEle,
	State.EndAttrSEle,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.StartElement   */,
	/* Token.EndElement     */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrEEle,
	State.EndAttrEEle,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.EndElement     */,
	/* Token.StartAttribute */ State.RootLevelAttr,
	State.Error,
	State.Error,
	State.Attribute,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrSAttr,
	State.EndAttrSAttr,
	State.Error,
	State.StartRootLevelAttr,
	State.StartRootLevelAttr,
	State.PostB64RootAttr,
	State.RootLevelAttr,
	State.Error /* Token.StartAttribute */,
	/* Token.EndAttribute   */ State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Element,
	State.Element,
	State.Error,
	State.AfterRootLevelAttr,
	State.AfterRootLevelAttr,
	State.PostB64RootAttr,
	State.Error,
	State.Error /* Token.EndAttribute   */,
	/* Token.Text           */ State.StartFragCont,
	State.StartFragCont,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Content,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.RootLevelAttr,
	State.RootLevelSpecAttr,
	State.PostB64RootAttr,
	State.Error,
	State.Error /* Token.Text           */,
	/* Token.CData          */ State.StartFragCont,
	State.StartFragCont,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Content,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.CData          */,
	/* Token.AtomicValue    */ State.StartFragCont,
	State.StartFragCont,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Content,
	State.Attribute,
	State.Error,
	State.Error,
	State.RootLevelAttr,
	State.Error,
	State.PostB64RootAttr,
	State.Error,
	State.Error /* Token.AtomicValue    */,
	/* Token.Base64         */ State.StartFragB64,
	State.StartFragB64,
	State.Error,
	State.StartContentB64,
	State.B64Content,
	State.B64Content,
	State.B64Attribute,
	State.B64Content,
	State.B64Attribute,
	State.Error,
	State.Error,
	State.RootLevelB64Attr,
	State.Error,
	State.RootLevelB64Attr,
	State.Error,
	State.Error /* Token.Base64         */,
	/* Token.RawData        */ State.StartFragCont,
	State.TopLevel,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Content,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.RootLevelAttr,
	State.RootLevelSpecAttr,
	State.PostB64RootAttr,
	State.AfterRootLevelAttr,
	State.Error /* Token.RawData        */,
	/* Token.Whitespace     */ State.TopLevel,
	State.TopLevel,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.RootLevelAttr,
	State.RootLevelSpecAttr,
	State.PostB64RootAttr,
	State.AfterRootLevelAttr,
	State.Error /* Token.Whitespace     */,
] as const;

// https://source.dot.net/#System.Private.Xml/System/Xml/IXmlNamespaceResolver.cs,853789bff6dc9c81,references
interface IXmlNamespaceResolver {
	lookupNamespace(prefix: string): string | undefined;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriter.cs,bed27629b0b34fb7,references
export class XmlWellFormedWriter extends XmlWriter {
	//
	// Fields
	//
	// underlying writer
	private readonly rawWriter: XmlRawWriter | undefined; // writer as XmlRawWriter
	private readonly predefinedNamespaces: IXmlNamespaceResolver | undefined; // writer as IXmlNamespaceResolver

	// namespace management
	private nsStack: Namespace[];
	private nsTop: number;
	private useNsHashtable = false;

	// element scoping
	private elemScopeStack: ElementScope[];
	private elemTop: number;

	// attribute tracking
	private attrStack: AttrName[];
	private attrCount = 0;

	// special attribute caching (xmlns, xml:space, xml:lang)
	private specAttr = SpecialAttribute.No;
	private attrValueCache?: AttributeValueCache;
	private curDeclPrefix?: string;

	// state machine
	private stateTable: readonly State[];
	private currentState: State;

	// settings
	private readonly omitDuplNamespaces: boolean;
	private readonly writeEndDocumentOnClose: boolean;

	// actual conformance level
	private conformanceLevel: ConformanceLevel;

	// flags
	private xmlDeclFollows = false;

	/** @internal */ constructor(
		private readonly writer:
			| XmlWriter
			| (XmlWriter & IXmlNamespaceResolver),
		settings: XmlWriterSettings,
	) {
		super();

		if (writer === undefined) {
			throw new Error('Assertion failed.');
		}
		if (settings === undefined) {
			throw new Error('Assertion failed.');
		}
		/* TODO: if (maxNamespacesWalkCount > 3) {
			throw new Error('Assertion failed.');
		} */

		if (writer instanceof XmlRawWriter) {
			this.rawWriter = writer;
		}
		if ('lookupNamespace' in writer) {
			this.predefinedNamespaces = writer;
		}

		// TODO
		this.omitDuplNamespaces =
			(settings.namespaceHandling & NamespaceHandling.OmitDuplicates) !==
			0;
		this.writeEndDocumentOnClose = settings.writeEndDocumentOnClose;

		this.conformanceLevel = settings.conformanceLevel;
		this.stateTable =
			this.conformanceLevel === ConformanceLevel.Document
				? stateTableDocument
				: stateTableAuto;

		this.currentState = State.Start;

		this.nsStack = new Array(namespaceStackInitialSize);
		for (let i = 0; i < this.nsStack.length; i++) {
			this.nsStack[i] = new Namespace();
		}
		this.nsStack[0].set(
			'xmlns',
			XmlReservedNs.NsXmlNs,
			NamespaceKind.Special,
		);
		this.nsStack[1].set('xml', XmlReservedNs.NsXml, NamespaceKind.Special);
		if (this.predefinedNamespaces === undefined) {
			this.nsStack[2].set('', '', NamespaceKind.Implied);
		} else {
			const defaultNs = this.predefinedNamespaces.lookupNamespace('');
			this.nsStack[2].set('', defaultNs ?? '', NamespaceKind.Implied);
		}
		this.nsTop = 2;

		this.elemScopeStack = new Array(elementStackInitialSize);
		for (let i = 0; i < this.elemScopeStack.length; i++) {
			this.elemScopeStack[i] = new ElementScope();
		}
		this.elemScopeStack[0].set('', '', '', this.nsTop);
		this.elemScopeStack[0].xmlSpace = XmlSpace.None;
		this.elemScopeStack[0].xmlLang = undefined;
		this.elemTop = 0;

		this.attrStack = new Array(attributeArrayInitialSize);
		for (let i = 0; i < this.attrStack.length; i++) {
			this.attrStack[i] = new AttrName();
		}
	}

	private get saveAttrValue(): boolean {
		return this.specAttr !== SpecialAttribute.No;
	}

	private get inBase64(): boolean {
		return (
			this.currentState === State.B64Content ||
			this.currentState === State.B64Attribute ||
			this.currentState === State.RootLevelB64Attr
		);
	}

	private static getStateName(state: State): string {
		if (state > State.Error) {
			throw new Error(
				`We should never get to this point. State = ${state}`,
			);
		} else {
			return stateName[state as keyof typeof stateName];
		}
	}

	private startElementContent(): void {
		// write namespace declarations
		const start = this.elemScopeStack[this.elemTop].prevNSTop;
		for (let i = this.nsTop; i > start; i--) {
			if (this.nsStack[i].kind === NamespaceKind.NeedToWrite) {
				this.nsStack[i].writeDecl(this.writer, this.rawWriter);
			}
		}

		this.rawWriter?.startElementContent();
	}

	// Advance the state machine
	private advanceState(token: Token): void {
		if (this.currentState >= State.Closed) {
			if (
				this.currentState === State.Closed ||
				this.currentState === State.Error
			) {
				throw new Error(
					'The Writer is closed or in error state.' /* LOC */,
				);
			} else {
				throw new Error(
					`Token ${
						tokenName[token]
					} in state ${XmlWellFormedWriter.getStateName(
						this.currentState,
					)} would result in an invalid XML document.` /* LOC */,
				);
			}
		}

		Advance: do {
			let newState = this.stateTable[(token << 4) + this.currentState];
			//                         [ (int)token * 16 + (int)currentState ];

			if (newState >= State.Error) {
				switch (newState) {
					case State.Error:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartContent:
						this.startElementContent();
						newState = State.Content;
						break;

					case State.StartContentEle:
						this.startElementContent();
						newState = State.Element;
						break;

					case State.StartContentB64:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartDoc:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartDocEle:
						// TODO
						throw new Error('Method not implemented.');

					case State.EndAttrSEle:
						// TODO
						throw new Error('Method not implemented.');

					case State.EndAttrEEle:
						// TODO
						throw new Error('Method not implemented.');

					case State.EndAttrSCont:
						// TODO
						throw new Error('Method not implemented.');

					case State.EndAttrSAttr:
						// TODO
						throw new Error('Method not implemented.');

					case State.PostB64Cont:
						// TODO
						throw new Error('Method not implemented.');

					case State.PostB64Attr:
						// TODO
						throw new Error('Method not implemented.');

					case State.PostB64RootAttr:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartFragEle:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartFragCont:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartFragB64:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartRootLevelAttr:
						// TODO
						throw new Error('Method not implemented.');

					default:
						throw new Error('We should not get to this point.');
				}
			}

			this.currentState = newState;
			break;
		} while (true);
	}

	private writeStartDocumentImpl(standalone: XmlStandalone): void {
		try {
			this.advanceState(Token.StartDocument);

			if (this.conformanceLevel === ConformanceLevel.Auto) {
				// TODO
				throw new Error('Method not implemented.');
			} else if (this.conformanceLevel === ConformanceLevel.Fragment) {
				// TODO
				throw new Error('Method not implemented.');
			}

			if (this.rawWriter !== undefined) {
				if (!this.xmlDeclFollows) {
					this.rawWriter.writeXmlDeclaration(standalone);
				}
			} else {
				// TODO
				throw new Error('Method not implemented.');
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	writeStartDocument(): void {
		this.writeStartDocumentImpl(XmlStandalone.Omit);
	}

	writeEndDocument(): void {
		try {
			// auto-close all elements
			while (this.elemTop > 0) {
				this.writeEndElement();
			}
			const prevState = this.currentState;
			this.advanceState(Token.EndDocument);

			if (prevState !== State.AfterRootEle) {
				throw new Error(
					'Document does not have a root element.' /* LOC */,
				);
			}
			if (this.rawWriter === undefined) {
				this.writer.writeEndDocument();
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	private static checkNCName(ncname: string): void {
		if (ncname === undefined || ncname.length <= 0) {
			throw new Error('Assertion failed.');
		}

		let i: number;
		const endPos = ncname.length;

		// Check if first character is StartNCName (inc. surrogates)
		if (isStartNCNameSingleChar(ncname.charCodeAt(0))) {
			i = 1;
		} else {
			throw new Error(/* TODO: message */);
		}

		// Check if following characters are NCName (inc. surrogates)
		while (i < endPos) {
			if (isNCNameSingleChar(ncname.charCodeAt(i))) {
				i++;
			} else {
				throw new Error(/* TODO: message */);
			}
		}
	}

	lookupPrefix(ns: string): string | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	/** @internal */ lookupNamespace(prefix: string): string | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	private lookupNamespaceIndex(prefix: string): number {
		if (this.useNsHashtable) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			for (let i = this.nsTop; i >= 0; i--) {
				if (this.nsStack[i].prefix === prefix) {
					return i;
				}
			}
		}
		return -1;
	}

	private addNamespace(
		prefix: string,
		ns: string,
		kind: NamespaceKind,
	): void {
		const top = ++this.nsTop;
		if (top === this.nsStack.length) {
			const newStack: Namespace[] = new Array(top * 2);
			// OPTIMIZE
			for (let i = 0; i < top; i++) {
				newStack[i] = this.nsStack[i];
			}
			for (let i = top; i < newStack.length; i++) {
				newStack[i] = new Namespace();
			}
			this.nsStack = newStack;
		}
		this.nsStack[top].set(prefix, ns, kind);

		if (this.useNsHashtable) {
			// TODO
			throw new Error('Method not implemented.');
		} else if (this.nsTop === maxNamespacesWalkCount) {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	// PushNamespaceImplicit is called when a prefix/namespace pair is used in an element name, attribute name or some other qualified name.
	private pushNamespaceImplicit(prefix: string, ns: string): void {
		let kind: NamespaceKind;

		// See if the prefix is already defined
		const existingNsIndex = this.lookupNamespaceIndex(prefix);

		// Prefix is already defined
		if (existingNsIndex !== -1) {
			// It is defined in the current scope
			if (existingNsIndex > this.elemScopeStack[this.elemTop].prevNSTop) {
				// TODO
				throw new Error('Method not implemented.');
			}
			// The prefix is defined but in a different scope
			else {
				// existing declaration is special one (xml, xmlns) -> validate that the new one is the same and can be declared
				if (
					this.nsStack[existingNsIndex].kind === NamespaceKind.Special
				) {
					if (prefix === 'xml') {
						if (ns !== this.nsStack[existingNsIndex].namespaceUri) {
							throw new Error(
								'Prefix "xml" is reserved for use by XML and can be mapped only to namespace name "http://www.w3.org/XML/1998/namespace".' /* LOC */,
							);
						} else {
							kind = NamespaceKind.Implied;
						}
					} else {
						if (prefix !== 'xmlns') {
							throw new Error('Assertion failed.');
						}
						throw new Error(
							'Prefix "xmlns" is reserved for use by XML.' /* LOC */,
						);
					}
				}
				// regular namespace declaration -> compare the namespace Uris to decide if the prefix is redefined
				else {
					kind =
						this.nsStack[existingNsIndex].namespaceUri === ns
							? NamespaceKind.Implied
							: NamespaceKind.NeedToWrite;
				}
			}
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}

		this.addNamespace(prefix, ns, kind);
	}

	writeStartElement(
		prefix: string | undefined,
		localName: string,
		ns: string | undefined,
	): void {
		try {
			// check local name
			if (localName === undefined || localName.length === 0) {
				throw new Error(
					"The empty string '' is not a valid local name." /* LOC */,
				);
			}
			XmlWellFormedWriter.checkNCName(localName);

			this.advanceState(Token.StartElement);

			// lookup prefix / namespace
			if (prefix === undefined) {
				if (ns !== undefined) {
					prefix = this.lookupPrefix(ns);
				}
				prefix ??= '';
			} else if (prefix.length > 0) {
				XmlWellFormedWriter.checkNCName(prefix);
				ns ??= this.lookupNamespace(prefix);
				if (ns === undefined || (ns !== undefined && ns.length === 0)) {
					throw new Error(
						'Cannot use a prefix with an empty namespace.' /* LOC */,
					);
				}
			}
			if (ns === undefined) {
				ns = this.lookupNamespace(prefix);
				if (ns === undefined) {
					if (prefix.length !== 0) {
						throw new Error('Assertion failed.');
					}
					ns = '';
				}
			}

			if (this.elemTop === 0 && this.rawWriter !== undefined) {
				// notify the underlying raw writer about the root level element
				this.rawWriter.onRootElement(this.conformanceLevel);
			}

			// write start tag
			this.writer.writeStartElement(prefix, localName, ns);

			// push element on stack and add/check namespace
			const top = ++this.elemTop;
			if (top === this.elemScopeStack.length) {
				// TODO
				throw new Error('Method not implemented.');
			}
			this.elemScopeStack[top].set(prefix, localName, ns, this.nsTop);

			this.pushNamespaceImplicit(prefix, ns);

			if (this.attrCount >= maxAttrDuplWalkCount) {
				// TODO
				throw new Error('Method not implemented.');
			}
			this.attrCount = 0;
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	writeEndElement(): void {
		try {
			this.advanceState(Token.EndElement);

			let top = this.elemTop;
			if (top === 0) {
				throw new XmlError(
					'There was no XML start tag open.' /* LOC */,
				);
			}

			// write end tag
			if (this.rawWriter !== undefined) {
				this.elemScopeStack[top].writeEndElement(this.rawWriter);
			} else {
				this.writer.writeEndElement();
			}

			// pop namespaces
			const prevNsTop = this.elemScopeStack[top].prevNSTop;
			if (this.useNsHashtable && prevNsTop < this.nsTop) {
				this.popNamespaces(prevNsTop + 1, this.nsTop);
			}
			this.nsTop = prevNsTop;
			this.elemTop = --top;

			// check "one root element" condition for ConformanceLevel.Document
			if (top === 0) {
				if (this.conformanceLevel === ConformanceLevel.Document) {
					this.currentState = State.AfterRootEle;
				} else {
					this.currentState = State.TopLevel;
				}
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	private popNamespaces(indexFrom: number, indexTo: number): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	writeFullEndElement(): void {
		try {
			this.advanceState(Token.EndElement);

			let top = this.elemTop;
			if (top === 0) {
				throw new XmlError(
					'There was no XML start tag open.' /* LOC */,
				);
			}

			// write end tag
			if (this.rawWriter !== undefined) {
				this.elemScopeStack[top].writeFullEndElement(this.rawWriter);
			} else {
				this.writer.writeFullEndElement();
			}

			// pop namespaces
			const prevNsTop = this.elemScopeStack[top].prevNSTop;
			if (this.useNsHashtable && prevNsTop < this.nsTop) {
				this.popNamespaces(prevNsTop + 1, this.nsTop);
			}
			this.nsTop = prevNsTop;
			this.elemTop = --top;

			// check "one root element" condition for ConformanceLevel.Document
			if (top === 0) {
				if (this.conformanceLevel === ConformanceLevel.Document) {
					this.currentState = State.AfterRootEle;
				} else {
					this.currentState = State.TopLevel;
				}
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	private setSpecialAttribute(special: SpecialAttribute): void {
		this.specAttr = special;
		if (this.currentState === State.Attribute) {
			this.currentState = State.SpecialAttr;
		} else if (this.currentState === State.RootLevelAttr) {
			this.currentState = State.RootLevelSpecAttr;
		} else {
			throw new Error(
				'currentState === State.Attribute || currentState === State.RootLevelAttr',
			);
		}

		this.attrValueCache ??= new AttributeValueCache();
	}

	private lookupLocalNamespace(prefix: string): string | undefined {
		for (
			let i = this.nsTop;
			i > this.elemScopeStack[this.elemTop].prevNSTop;
			i--
		) {
			if (this.nsStack[i].prefix === prefix) {
				return this.nsStack[i].namespaceUri;
			}
		}
		return undefined;
	}

	private generatePrefix(): string {
		// TODO
		throw new Error('Method not implemented.');
	}

	private addAttribute(
		prefix: string,
		localName: string,
		namespaceName: string,
	): void {
		const top = this.attrCount++;
		if (top === this.attrStack.length) {
			// TODO
			throw new Error('Method not implemented.');
		}
		this.attrStack[top].set(prefix, localName, namespaceName);

		if (this.attrCount < maxAttrDuplWalkCount) {
			// check for duplicates
			for (let i = 0; i < top; i++) {
				if (
					this.attrStack[i].isDuplicate(
						prefix,
						localName,
						namespaceName,
					)
				) {
					throw new XmlError(/* TODO: message */);
				}
			}
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	writeStartAttribute(
		prefix: string | undefined,
		localName: string,
		namespaceName: string | undefined,
	): void {
		try {
			// check local name
			if (localName === undefined || localName.length === 0) {
				if (prefix === 'xmlns') {
					localName = 'xmlns';
					prefix = '';
				} else {
					throw new Error(
						`The empty string '' is not a valid local name.` /* LOC */,
					);
				}
			}

			XmlWellFormedWriter.checkNCName(localName);

			this.advanceState(Token.StartAttribute);

			// lookup prefix / namespace
			if (prefix === undefined) {
				if (namespaceName !== undefined) {
					// special case prefix=null/localname=xmlns
					if (
						!(
							localName === 'xmlns' &&
							namespaceName === XmlReservedNs.NsXmlNs
						)
					) {
						prefix = this.lookupPrefix(namespaceName);
					}
				}

				prefix ??= '';
			}
			if (namespaceName === undefined) {
				if (prefix.length > 0) {
					namespaceName = this.lookupNamespace(prefix);
				}
				namespaceName ??= '';
			}

			SkipPushAndWrite: do {
				if (prefix.length === 0) {
					if (localName[0] === 'x' && localName === 'xmlns') {
						if (
							namespaceName.length > 0 &&
							namespaceName !== XmlReservedNs.NsXmlNs
						) {
							throw new Error(
								'Prefix "xmlns" is reserved for use by XML.' /* LOC */,
							);
						}
						this.curDeclPrefix = '';
						this.setSpecialAttribute(SpecialAttribute.DefaultXmlns);
						break SkipPushAndWrite;
					} else if (namespaceName.length > 0) {
						prefix = this.lookupPrefix(namespaceName);
						if (prefix === undefined || prefix.length === 0) {
							prefix = this.generatePrefix();
						}
					}
				} else {
					if (prefix[0] === 'x') {
						// TODO
						throw new Error('Method not implemented.');
					}

					XmlWellFormedWriter.checkNCName(prefix);

					if (prefix.length === 0) {
						// attributes cannot have default namespace
						prefix = '';
					} else {
						const definedNs = this.lookupLocalNamespace(prefix);
						if (
							definedNs !== undefined &&
							definedNs !== namespaceName
						) {
							prefix = this.generatePrefix();
						}
					}
				}

				if (prefix.length !== 0) {
					this.pushNamespaceImplicit(prefix, namespaceName);
				}
			} while (false);

			// add attribute to the list and check for duplicates
			this.addAttribute(prefix, localName, namespaceName);

			if (this.specAttr === SpecialAttribute.No) {
				// write attribute name
				this.writer.writeStartAttribute(
					prefix,
					localName,
					namespaceName,
				);
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	// PushNamespaceExplicit is called when a namespace declaration is written out;
	// It returns true if the namespace declaration should we written out, false if it should be omitted (if OmitDuplicateNamespaceDeclarations is true)
	private pushNamespaceExplicit(prefix: string, ns: string): boolean {
		let writeItOut = true;

		// See if the prefix is already defined
		const existingNsIndex = this.lookupNamespaceIndex(prefix);

		// Existing declaration in the current scope
		if (existingNsIndex !== -1) {
			// It is defined in the current scope
			if (existingNsIndex > this.elemScopeStack[this.elemTop].prevNSTop) {
				// The new namespace Uri needs to be the same as the one that is already declared
				if (this.nsStack[existingNsIndex].namespaceUri !== ns) {
					throw new XmlError(/* TODO: message */);
				}
				// Check for duplicate declarations
				const existingNsKind = this.nsStack[existingNsIndex].kind;
				if (existingNsKind === NamespaceKind.Written) {
					throw new XmlError(/* TODO: message */);
				}
				// Check if it can be omitted
				if (
					this.omitDuplNamespaces &&
					existingNsKind !== NamespaceKind.NeedToWrite
				) {
					writeItOut = false;
				}
				this.nsStack[existingNsIndex].kind = NamespaceKind.Written;
				// No additional work needed
				return writeItOut;
			}
			// The prefix is defined but in a different scope
			else {
				// check if is the same and can be omitted
				if (
					this.nsStack[existingNsIndex].namespaceUri === ns &&
					this.omitDuplNamespaces
				) {
					writeItOut = false;
				}
			}
		}
		// No existing declaration found in the namespace stack
		else {
			// TODO
			throw new Error('Method not implemented.');
		}

		// validate special declaration (xml, xmlns)
		if (
			(ns === XmlReservedNs.NsXml && prefix !== 'xml') ||
			(ns === XmlReservedNs.NsXmlNs && prefix !== 'xmlns')
		) {
			throw new Error(
				`Prefix '${prefix}' cannot be mapped to namespace name reserved for "xml" or "xmlns".` /* LOC */,
			);
		}
		if (prefix.startsWith('x')) {
			if (prefix === 'xml') {
				if (ns !== XmlReservedNs.NsXml) {
					throw new Error(
						'Prefix "xml" is reserved for use by XML and can be mapped only to namespace name "http://www.w3.org/XML/1998/namespace".' /* LOC */,
					);
				}
			} else if (prefix === 'xmlns') {
				throw new Error(
					'Prefix "xmlns" is reserved for use by XML.' /* LOC */,
				);
			}
		}

		this.addNamespace(prefix, ns, NamespaceKind.Written);

		return writeItOut;
	}

	writeEndAttribute(): void {
		try {
			this.advanceState(Token.EndAttribute);

			if (this.specAttr !== SpecialAttribute.No) {
				if (this.attrValueCache === undefined) {
					throw new Error('Method not implemented.');
				}
				let value: string;

				switch (this.specAttr) {
					case SpecialAttribute.DefaultXmlns:
						value = this.attrValueCache.stringValue;
						if (this.pushNamespaceExplicit('', value)) {
							// returns true if the namespace declaration should be written out
							if (this.rawWriter !== undefined) {
								if (
									this.rawWriter
										.supportsNamespaceDeclarationInChunks
								) {
									// TODO
									throw new Error('Method not implemented.');
								} else {
									this.rawWriter.writeNamespaceDeclaration(
										'',
										value,
									);
								}
							} else {
								// TODO
								throw new Error('Method not implemented.');
							}
						}
						this.curDeclPrefix = undefined;
						break;
					case SpecialAttribute.PrefixedXmlns:
						// TODO
						throw new Error('Method not implemented.');
					case SpecialAttribute.XmlSpace:
						// TODO
						throw new Error('Method not implemented.');
					case SpecialAttribute.XmlLang:
						// TODO
						throw new Error('Method not implemented.');
				}
				this.specAttr = SpecialAttribute.No;
				this.attrValueCache.clear();
			} else {
				this.writer.writeEndAttribute();
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	writeCData(text: string | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	writeComment(text: string | undefined): void {
		try {
			text ??= '';
			this.advanceState(Token.Comment);
			this.writer.writeComment(text);
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	writeWhitespace(ws: string | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	writeString(text: string | undefined): void {
		try {
			if (text === undefined) {
				return;
			}

			this.advanceState(Token.Text);
			if (this.saveAttrValue) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.attrValueCache!.writeString(text);
			} else {
				this.writer.writeString(text);
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	get writeState(): WriteState {
		if (this.currentState <= State.Error) {
			return state2WriteState[
				this.currentState as keyof typeof state2WriteState
			];
		} else {
			throw new Error('Expected currentState <= State.Error ');
		}
	}

	close(): void {
		if (this.currentState !== State.Closed) {
			try {
				if (this.writeEndDocumentOnClose) {
					while (
						this.currentState !== State.Error &&
						this.elemTop > 0
					) {
						this.writeEndElement();
					}
				} else {
					if (this.currentState !== State.Error && this.elemTop > 0) {
						//finish the start element tag '>'
						try {
							this.advanceState(Token.EndElement);
						} catch (error) {
							this.currentState = State.Error;
							throw error;
						}
					}
				}

				if (this.inBase64 && this.rawWriter !== undefined) {
					this.rawWriter.writeEndBase64();
				}

				this.writer.flush();
			} finally {
				try {
					if (this.rawWriter !== undefined) {
						this.rawWriter.closeWithWriteState(this.writeState);
					} else {
						this.writer.close();
					}
				} finally {
					this.currentState = State.Closed;
				}
			}
		}
	}

	flush(): void {
		try {
			this.writer.flush();
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}
}
