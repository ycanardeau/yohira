import { XNamespace } from './XNamespace';
import { XElement, XNode } from './XNode';
import { XmlWriter } from './XmlWriter';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XLinq.cs,134810eae687636a,references
export class NamespaceCache {
	private ns: XNamespace = undefined!;
	private namespaceName: string = undefined!;

	get(namespaceName: string): XNamespace {
		if (namespaceName === this.namespaceName /* REVIEW */) {
			return this.ns;
		}
		this.namespaceName = namespaceName;
		this.ns = XNamespace.get(namespaceName, 0, namespaceName.length);
		return this.ns;
	}
}

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XLinq.cs,92246886835c7f91,references
/**
 * Specifies a set of options for load().
 */
export enum LoadOptions {
	/**
	 * Default options.
	 */
	None = 0x00000000,
	/**
	 * Preserve whitespace.
	 */
	PreserveWhitespace = 0x00000001,
	/**
	 * Set the BaseUri property.
	 */
	SetBaseUri = 0x00000002,
	/**
	 * Set the IXmlLineInfo.
	 */
	SetLineInfo = 0x00000004,
}

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XLinq.cs,ab1c46fb86d0d183,references
/**
 * Specifies a set of options for Save().
 */
export enum SaveOptions {
	/// <summary>Default options.</summary>
	None = 0x00000000,
	/// <summary>Disable formatting.</summary>
	DisableFormatting = 0x00000001,
	/// <summary>Remove duplicate namespace declarations.</summary>
	OmitDuplicateNamespaces = 0x00000002,
}

class NamespaceDeclaration {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	prefix: string = undefined!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	ns: XNamespace = undefined!;
	scope = 0;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	prev: NamespaceDeclaration = undefined!;
}

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XLinq.cs,84aa37da63f3d367,references
class NamespaceResolver {
	private scope = 0;
	private declaration?: NamespaceDeclaration;
	private rover?: NamespaceDeclaration;

	pushScope(): void {
		this.scope++;
	}

	popScope(): void {
		let d = this.declaration;
		if (d !== undefined) {
			do {
				d = d.prev;
				if (d.scope !== this.scope) {
					break;
				}
				if (d === this.declaration) {
					this.declaration = undefined;
				} else {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					this.declaration!.prev = d.prev;
				}
				this.rover = undefined;
			} while (d !== this.declaration && this.declaration !== undefined);
		}
		this.scope--;
	}

	add(prefix: string, ns: XNamespace): void {
		const d = new NamespaceDeclaration();
		d.prefix = prefix;
		d.ns = ns;
		d.scope = this.scope;
		if (this.declaration === undefined) {
			this.declaration = d;
		} else {
			d.prev = this.declaration.prev;
		}
		this.declaration.prev = d;
		this.rover = undefined;
	}

	addFirst(prefix: string, ns: XNamespace): void {
		const d = new NamespaceDeclaration();
		d.prefix = prefix;
		d.ns = ns;
		d.scope = this.scope;
		if (this.declaration === undefined) {
			d.prev = d;
		} else {
			d.prev = this.declaration.prev;
			this.declaration.prev = d;
		}
		this.declaration = d;
		this.rover = undefined;
	}

	// Only elements allow default namespace declarations. The rover
	// caches the last namespace declaration used by an element.
	getPrefixOfNamespace(
		ns: XNamespace,
		allowDefaultNamespace: boolean,
	): string | undefined {
		if (
			this.rover !== undefined &&
			this.rover.ns === ns &&
			(allowDefaultNamespace || this.rover.prefix.length > 0)
		) {
			return this.rover.prefix;
		}
		let d = this.declaration;
		if (d !== undefined) {
			do {
				d = d.prev;
				if (d.ns === ns) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					let x = this.declaration!.prev;
					while (x !== d && x.prefix !== d.prefix) {
						x = x.prev;
					}
					if (x === d) {
						if (allowDefaultNamespace) {
							this.rover = d;
							return d.prefix;
						} else if (d.prefix.length > 0) {
							return d.prefix;
						}
					}
				}
			} while (d !== this.declaration);
		}
		return undefined;
	}
}

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XLinq.cs,0e76c43175b45b00,references
export class ElementWriter {
	private resolver = new NamespaceResolver();

	constructor(private readonly writer: XmlWriter) {}

	private pushAncestors(e: XElement | undefined): void {
		while (true) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			e = e!.parent as XElement;
			if (e === undefined) {
				break;
			}
			let a = e.lastAttr;
			if (a !== undefined) {
				do {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					a = a.next!;
					if (a.isNamespaceDeclaration) {
						this.resolver.addFirst(
							a.name.namespaceName.length === 0
								? ''
								: a.name.localName,
							XNamespace.get(a.value, 0, a.value.length),
						);
					}
				} while (a !== e.lastAttr);
			}
		}
	}

	private pushElement(e: XElement): void {
		this.resolver.pushScope();
		let a = e.lastAttr;
		if (a !== undefined) {
			do {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				a = a.next!;
				if (a.isNamespaceDeclaration) {
					this.resolver.add(
						a.name.namespaceName.length === 0
							? ''
							: a.name.localName,
						XNamespace.get(a.value, 0, a.value.length),
					);
				}
			} while (a !== e.lastAttr);
		}
	}

	private getPrefixOfNamespace(
		ns: XNamespace,
		allowDefaultNamespace: boolean,
	): string | undefined {
		const namespaceName = ns.namespaceName;
		if (namespaceName.length === 0) {
			return '';
		}
		const prefix = this.resolver.getPrefixOfNamespace(
			ns,
			allowDefaultNamespace,
		);
		if (prefix !== undefined) {
			return prefix;
		}
		if (namespaceName === XNamespace.xmlPrefixNamespace /* REVIEW */) {
			return 'xml';
		}
		if (namespaceName === XNamespace.xmlnsPrefixNamespace /* REVIEW */) {
			return 'xmlns';
		}
		return undefined;
	}

	private writeStartElement(e: XElement): void {
		this.pushElement(e);
		let ns = e.name.namespace;
		this.writer.writeStartElement(
			this.getPrefixOfNamespace(ns, true),
			e.name.localName,
			ns.namespaceName,
		);
		let a = e.lastAttr;
		if (a !== undefined) {
			do {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				a = a.next!;
				ns = a.name.namespace;
				const localName = a.name.localName;
				const namespaceName = ns.namespaceName;
				this.writer.writeAttributeString(
					this.getPrefixOfNamespace(ns, false),
					localName,
					namespaceName.length === 0 && localName === 'xmlns'
						? XNamespace.xmlnsPrefixNamespace
						: namespaceName,
					a.value,
				);
			} while (a !== e.lastAttr);
		}
	}

	private writeEndElement(): void {
		this.writer.writeEndElement();
		this.resolver.popScope();
	}

	private writeFullEndElement(): void {
		this.writer.writeFullEndElement();
		this.resolver.popScope();
	}

	writeElement(e: XElement): void {
		this.pushAncestors(e);
		const root = e;
		let n = e as XNode;
		while (true) {
			if (n instanceof XElement) {
				this.writeStartElement(n);
				if (n.content === undefined) {
					this.writeEndElement();
				} else {
					if (typeof n.content === 'string') {
						this.writer.writeString(n.content);
						this.writeFullEndElement();
					} else {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						n = (n.content as XNode).next!;
						continue;
					}
				}
			} else {
				n.writeTo(this.writer);
			}
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			while (n !== root && n === n.parent!.content) {
				n = n.parent!;
				this.writeFullEndElement();
			}
			if (n === root) {
				break;
			}
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			n = n.next!;
		}
	}
}
