import { using } from './IDisposable';
import { StringReader } from './StringReader';
import { TextWriter } from './TextWriter';
import { XAttribute } from './XAttribute';
import { XComment } from './XComment';
import {
	ElementWriter,
	LoadOptions,
	NamespaceCache,
	SaveOptions,
} from './XLinq';
import { XName } from './XName';
import { XNamespace } from './XNamespace';
import { XNode } from './XNode';
import { XmlNodeType } from './XmlNodeType';
import { ReadState, XmlReader } from './XmlReader';
import { XmlWriter } from './XmlWriter';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XContainer.cs,3b4836bc20a61acf,references
class ContentReader {
	private readonly eCache = new NamespaceCache();
	private readonly aCache = new NamespaceCache();
	private currentContainer: XContainer;

	constructor(rootContainer: XContainer) {
		this.currentContainer = rootContainer;
	}

	readContentFrom(rootContainer: XContainer, r: XmlReader): boolean {
		switch (r.nodeType) {
			case XmlNodeType.Element:
				const e = XElement.fromName(
					this.eCache
						.get(r.namespaceURI)
						.getName(r.localName, 0, r.localName.length),
				);
				if (r.moveToFirstAttribute()) {
					do {
						e.appendAttributeSkipNotify(
							new XAttribute(
								this.aCache
									.get(
										r.prefix.length === 0
											? ''
											: r.namespaceURI,
									)
									.getName(
										r.localName,
										0,
										r.localName.length,
									),
								r.value,
							),
						);
					} while (r.moveToNextAttribute());
					r.moveToElement();
				}
				this.currentContainer.addNodeSkipNotify(e);
				if (!r.isEmptyElement) {
					this.currentContainer = e;
				}
				break;
			case XmlNodeType.EndElement:
				this.currentContainer.content ??= '';
				if (this.currentContainer === rootContainer) {
					return false;
				}
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.currentContainer = this.currentContainer.parent!;
				break;
			case XmlNodeType.Text:
			case XmlNodeType.SignificantWhitespace:
			case XmlNodeType.Whitespace:
				this.currentContainer.addStringSkipNotify(r.value);
				break;
			case XmlNodeType.CDATA:
				// TODO
				throw new Error('Method not implemented.');
			case XmlNodeType.Comment:
				this.currentContainer.addNodeSkipNotify(new XComment(r.value));
				break;
			case XmlNodeType.ProcessingInstruction:
				// TODO
				throw new Error('Method not implemented.');
			case XmlNodeType.DocumentType:
				// TODO
				throw new Error('Method not implemented.');
			case XmlNodeType.EntityReference:
				// TODO
				throw new Error('Method not implemented.');
			case XmlNodeType.EndEntity:
				// TODO
				throw new Error('Method not implemented.');
			default:
				throw new Error(
					`The XmlReader should not be on a node of type ${
						XmlNodeType[r.nodeType]
					}.` /* LOC */,
				);
		}
		return true;
	}
}

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XContainer.cs,071975611afa24f5,references
export abstract class XContainer extends XNode {
	/** @internal */ content?: string | XNode; /* TODO: object */

	/** @internal */ static getStringValue(
		value: string /* TODO: object */,
	): string {
		if (typeof value === 'string') {
			return value;
		}
		// TODO

		if (value === undefined) {
			throw new Error(
				'The argument cannot be converted to a string.' /* LOC */,
			);
		}
		return value;
	}

	// Validate insertion of the given node. previous is the node after which insertion
	// will occur. previous == null means at beginning, previous == this means at end.
	/** @internal */ validateNode(
		node: XNode,
		previous: XNode | undefined,
	): void {}

	/** @internal */ convertTextToNode(): void {
		if (typeof this.content === 'string' && this.content) {
			const t = new XText(this.content);
			t.parent = this;
			t.next = t;
			this.content = t;
		}
	}

	/** @internal */ appendNodeSkipNotify(n: XNode): void {
		n.parent = this;
		if (this.content === undefined || typeof this.content === 'string') {
			n.next = n;
		} else {
			const x = this.content as XNode;
			n.next = x.next;
			x.next = n;
		}
		this.content = n;
	}

	/** @internal */ validateString(s: string): void {}

	/** @internal */ addStringSkipNotify(s: string): void {
		this.validateString(s);
		if (this.content === undefined) {
			this.content = s;
		} else if (s.length > 0) {
			if (typeof this.content === 'string') {
				this.content = this.content + s;
			} else {
				if (
					this.content instanceof XText &&
					!(this.content instanceof XCData)
				) {
					this.content.text += s;
				} else {
					this.appendNodeSkipNotify(new XText(s));
				}
			}
		}
	}

	/** @internal */ addNodeSkipNotify(n: XNode): void {
		this.validateNode(n, this);
		if (n.parent !== undefined) {
			n = n.cloneNode();
		} else {
			let p = this as XNode;
			while (p.parent !== undefined) {
				p = p.parent;
			}
			if (n === p) {
				n = n.cloneNode();
			}
		}
		this.convertTextToNode();
		this.appendNodeSkipNotify(n);
	}

	/** @internal */ readContentFromCore(r: XmlReader): void {
		if (r.readState !== ReadState.Interactive) {
			throw new Error(
				'The XmlReader state should be Interactive.' /* LOC */,
			);
		}

		const cr = new ContentReader(this);
		while (cr.readContentFrom(this, r) && r.read());
	}

	/** @internal */ readContentFrom(r: XmlReader, o: LoadOptions): void {
		if ((o & (LoadOptions.SetBaseUri | LoadOptions.SetLineInfo)) === 0) {
			this.readContentFromCore(r);
			return;
		}
		if (r.readState !== ReadState.Interactive) {
			throw new Error(
				'The XmlReader state should be Interactive.' /* LOC */,
			);
		}

		// TODO
		throw new Error('Method not implemented.');
	}

	element(name: XName): XElement | undefined {
		let n = this.content;
		if (n instanceof XNode) {
			do {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				n = n.next!;
				if (n instanceof XElement && n.name === name) {
					return n;
				}
			} while (n !== this.content);
		}
		return undefined;
	}
}

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XDocument.cs,3354dac0913e417b,references
export class XDocument extends XContainer {
	writeTo(writer: XmlWriter): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	cloneNode(): XNode {
		// TODO
		throw new Error('Method not implemented.');
	}
}

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XText.cs,7dcfc7339b56ed0a,references
export class XText extends XNode {
	constructor(/** @internal */ public text: string) {
		super();
	}

	writeTo(writer: XmlWriter): void {
		if (this.parent instanceof XDocument) {
			writer.writeWhitespace(this.text);
		} else {
			writer.writeString(this.text);
		}
	}

	cloneNode(): XNode {
		// TODO
		throw new Error('Method not implemented.');
	}
}

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XCData.cs,061ab8c0aabbc761,references
export class XCData extends XText {
	writeTo(writer: XmlWriter): void {
		writer.writeCData(this.text);
	}
}

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XElement.cs,3367036406d1344a,references
export class XElement extends XContainer {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	/** @internal */ _name: XName = undefined!;
	/** @internal */ lastAttr?: XAttribute;

	static fromName(name: XName): XElement {
		const element = new XElement();
		element._name = name;
		return element;
	}

	static fromElement(other: XElement): XElement {
		// TODO
		throw new Error('Method not implemented.');
	}

	/** @internal */ cloneNode(): XNode {
		return XElement.fromElement(this);
	}

	/** @internal */ appendAttributeSkipNotify(a: XAttribute): void {
		a.parent = this;
		if (this.lastAttr === undefined) {
			a.next = a;
		} else {
			a.next = this.lastAttr.next;
			this.lastAttr.next = a;
		}
		this.lastAttr = a;
	}

	private readElementFromImpl(r: XmlReader, o: LoadOptions): void {
		if (r.readState !== ReadState.Interactive) {
			throw new Error('The XmlReader state should be Interactive.');
		}
		this._name = XNamespace.get(
			r.namespaceURI,
			0,
			r.namespaceURI.length,
		).getName(r.localName, 0, r.localName.length);
		if ((o & LoadOptions.SetBaseUri) !== 0) {
			// TODO
			throw new Error('Method not implemented.');
		}
		if ((o & LoadOptions.SetLineInfo) !== 0) {
			// TODO
			throw new Error('Method not implemented.');
		}
		if (r.moveToFirstAttribute()) {
			do {
				const namespaceName =
					r.prefix.length === 0 ? '' : r.namespaceURI;
				const a = new XAttribute(
					XNamespace.get(
						namespaceName,
						0,
						namespaceName.length,
					).getName(r.localName, 0, r.localName.length),
					r.value,
				);
				// TODO
				this.appendAttributeSkipNotify(a);
			} while (r.moveToNextAttribute());
			r.moveToElement();
		}
	}

	private readElementFrom(r: XmlReader, o: LoadOptions): void {
		this.readElementFromImpl(r, o);

		if (!r.isEmptyElement) {
			r.read();
			this.readContentFrom(r, o);
		}

		r.read();
	}

	static load(reader: XmlReader, options: LoadOptions): XElement {
		if (reader.moveToContent() !== XmlNodeType.Element) {
			throw new Error(
				`The XmlReader must be on a node of type ${
					XmlNodeType[XmlNodeType.Element]
				} instead of a node of type ${
					XmlNodeType[reader.nodeType]
				}.` /* LOC */,
			);
		}
		const e = new XElement();
		e.readElementFrom(reader, options);
		reader.moveToContent();
		if (!reader.eof) {
			throw new Error(
				'The XmlReader state should be EndOfFile after this operation.' /* LOC */,
			);
		}
		return e;
	}

	static parse(text: string, options = LoadOptions.None): XElement {
		return using(new StringReader(text), (sr) => {
			const rs = XNode.getXmlReaderSettings(options);
			return using(XmlReader.create(sr, rs), (r) => {
				return XElement.load(r, options);
			});
		});
	}

	get name(): XName {
		return this._name;
	}

	get value(): string {
		if (this.content === undefined) {
			return '';
		}
		if (typeof this.content === 'string') {
			return this.content;
		}
		// TODO
		throw new Error('Method not implemented.');
	}

	attribute(name: XName): XAttribute | undefined {
		let a: XAttribute | undefined = this.lastAttr;
		if (a !== undefined) {
			do {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				a = a.next!;
				if (a.name.equals(name)) {
					return a;
				}
			} while (a !== this.lastAttr);
		}
		return undefined;
	}

	private *getAttributes(name: XName | undefined): Generator<XAttribute> {
		let a = this.lastAttr;
		if (a !== undefined) {
			do {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				a = a.next!;
				if (name === undefined || a.name === name) {
					yield a;
				}
			} while (a.parent === this && a !== this.lastAttr);
		}
	}

	attributes(): Iterable<XAttribute> {
		return this.getAttributes(undefined);
	}

	writeTo(writer: XmlWriter): void {
		new ElementWriter(writer).writeElement(this);
	}

	saveCore(writer: XmlWriter): void {
		writer.writeStartDocument();
		this.writeTo(writer);
		writer.writeEndDocument();
	}

	save(textWriter: TextWriter, options = SaveOptions.None): void {
		const ws = XNode.getXmlWriterSettings(options);
		return using(XmlWriter.create(textWriter, ws), (w) => {
			this.saveCore(w);
		});
	}

	/** @internal */ appendAttribute(a: XAttribute): void {
		// TODO: const notify = this.notifyChanging(a, XObjectChangeEventArgs.Add);
		if (a.parent !== undefined) {
			throw new Error(
				'This operation was corrupted by external code.' /* LOC */,
			);
		}
		this.appendAttributeSkipNotify(a);
		/* TODO: if (notify) {
			this.notifyChanged(a, XObjectChangeEventArgs.Add);
		} */
	}

	/** @internal */ removeAttribute(a: XAttribute): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	setAttributeValue(
		name: XName,
		value: string /* TODO: object */ | undefined,
	): void {
		const a = this.attribute(name);
		if (value === undefined) {
			if (a !== undefined) {
				this.removeAttribute(a);
			}
		} else {
			if (a !== undefined) {
				a.value = XContainer.getStringValue(value);
			} else {
				this.appendAttribute(new XAttribute(name, value));
			}
		}
	}
}
