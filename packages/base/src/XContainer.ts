import { XAttribute } from './XAttribute';
import { XCData } from './XCData';
import { XComment } from './XComment';
import { XElement } from './XElement';
import { LoadOptions, NamespaceCache } from './XLinq';
import { XName } from './XName';
import { XNode } from './XNode';
import { XText } from './XText';
import { XmlNodeType } from './XmlNodeType';
import { ReadState, XmlReader } from './XmlReader';

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
