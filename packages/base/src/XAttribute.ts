import { XContainer } from './XContainer';
import { XName } from './XName';
import { XNamespace } from './XNamespace';
import { XObject } from './XObject';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XAttribute.cs,4ca7337be72c47a4,references
export class XAttribute extends XObject {
	/** @internal */ next?: XAttribute;
	/** @internal */ name: XName;
	/** @internal */ value: string;

	private static validateAttribute(name: XName, value: string): void {
		// The following constraints apply for namespace declarations:
		const namespaceName = name.namespaceName;
		if (namespaceName === XNamespace.xmlnsPrefixNamespace /* REVIEW */) {
			if (value.length === 0) {
				// TODO
				throw new Error('Method not implemented.');
			} else if (value === XNamespace.xmlPrefixNamespace) {
				// TODO
				throw new Error('Method not implemented.');
			} else if (value === XNamespace.xmlnsPrefixNamespace) {
				// TODO
				throw new Error('Method not implemented.');
			} else {
				const localName = name.localName;
				if (localName === 'xml') {
					// No other namespace name can be declared by the 'xml'
					// prefix namespace declaration.
					throw new Error(
						"The prefix 'xml' is bound to the namespace name 'http://www.w3.org/XML/1998/namespace'. Other prefixes must not be bound to this namespace name, and it must not be declared as the default namespace." /* LOC */,
					);
				} else if (localName === 'xmlns') {
					// The 'xmlns' prefix must not be declared.
					throw new Error(
						"The prefix 'xmlns' is bound to the namespace name 'http://www.w3.org/2000/xmlns/'. It must not be declared. Other prefixes must not be bound to this namespace name, and it must not be declared as the default namespace." /* LOC */,
					);
				}
			}
		} else if (namespaceName.length === 0 && name.localName === 'xmlns') {
			if (value === XNamespace.xmlPrefixNamespace) {
				// 'http://www.w3.org/XML/1998/namespace' can only
				// be declared by the 'xml' prefix namespace declaration.
				throw new Error(
					"The prefix 'xml' is bound to the namespace name 'http://www.w3.org/XML/1998/namespace'. Other prefixes must not be bound to this namespace name, and it must not be declared as the default namespace." /* LOC */,
				);
			} else if (value === XNamespace.xmlnsPrefixNamespace) {
				// 'http://www.w3.org/2000/xmlns/' must not be declared
				// by any namespace declaration.
				throw new Error(
					"The prefix 'xmlns' is bound to the namespace name 'http://www.w3.org/2000/xmlns/'. It must not be declared. Other prefixes must not be bound to this namespace name, and it must not be declared as the default namespace." /* LOC */,
				);
			}
		}
	}

	constructor(name: XName, value: string /* TODO: object */) {
		super();

		const s = XContainer.getStringValue(value);
		XAttribute.validateAttribute(name, s);
		this.name = name;
		this.value = s;
	}

	get isNamespaceDeclaration(): boolean {
		const namespaceName = this.name.namespaceName;
		if (namespaceName.length === 0) {
			return this.name.localName === 'xmlns';
		}
		return namespaceName === XNamespace.xmlnsPrefixNamespace /* REVIEW */;
	}
}
