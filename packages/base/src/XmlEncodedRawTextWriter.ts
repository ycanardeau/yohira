import { TextWriter } from './TextWriter';
import {
	isAttributeValueChar,
	isSurrogate,
	isTextChar,
	surHighStart,
} from './XmlCharType';
import { XmlRawWriter } from './XmlRawWriter';
import { XmlStandalone, XmlWriterSettings } from './XmlWriterSettings';

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
