import { using } from './IDisposable';
import { StringReader } from './StringReader';
import { XAttribute } from './XAttribute';
import { XContainer } from './XContainer';
import { LoadOptions } from './XLinq';
import { XName } from './XName';
import { XNamespace } from './XNamespace';
import { XNode } from './XNode';
import { XmlNodeType } from './XmlNodeType';
import { ReadState, XmlReader } from './XmlReader';

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
}
