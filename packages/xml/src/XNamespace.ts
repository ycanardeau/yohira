import { getStringHashCode, tryGetValue } from '@yohira/base';

import { XName } from './XName';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XNamespace.cs,b7fd36022953a5be,references
export class XNamespace {
	/** @internal */ static readonly xmlPrefixNamespace =
		'http://www.w3.org/XML/1998/namespace';
	/** @internal */ static readonly xmlnsPrefixNamespace =
		'http://www.w3.org/2000/xmlns/';

	private static namespaces:
		| Map<string, XNamespace> /* TODO: XHashtable */
		| undefined;

	private readonly hashCode: number;
	private readonly names: Map<string, XName>; /* TODO: XHashtable */

	constructor(readonly namespaceName: string) {
		this.hashCode = getStringHashCode(namespaceName);
		this.names = new Map() /* TODO: XHashtable */;
	}

	// REVIEW
	static readonly none = new XNamespace('');
	static readonly xml = new XNamespace(XNamespace.xmlPrefixNamespace);
	static readonly xmlns = new XNamespace(XNamespace.xmlnsPrefixNamespace);

	// REVIEW
	static get(
		namespaceName: string,
		index: number,
		count: number,
	): XNamespace {
		if (index < 0 || index > namespaceName.length) {
			throw new Error(
				'Caller should have checked that index was in bounds',
			);
		}
		if (count < 0 || index + count > namespaceName.length) {
			throw new Error(
				'Caller should have checked that count was in bounds',
			);
		}

		if (count === 0) {
			return XNamespace.none;
		}

		if (XNamespace.namespaces === undefined) {
			XNamespace.namespaces = new Map();
		}

		const tryGetValueResult = tryGetValue(
			XNamespace.namespaces,
			namespaceName.substring(index, index + count),
		);
		if (!tryGetValueResult.ok) {
			if (
				count === XNamespace.xmlPrefixNamespace.length &&
				namespaceName.substring(index, index + count) ===
					XNamespace.xmlPrefixNamespace
			) {
				return XNamespace.xml;
			}
			if (
				count === XNamespace.xmlnsPrefixNamespace.length &&
				namespaceName.substring(index, index + count) ===
					XNamespace.xmlnsPrefixNamespace
			) {
				return XNamespace.xmlns;
			}

			const namespace = new XNamespace(namespaceName);
			XNamespace.namespaces.set(namespaceName, namespace);
			return namespace;
		}

		return tryGetValueResult.val;
	}

	getName(localName: string, index: number, count: number): XName {
		if (index < 0 || index > localName.length) {
			throw new Error(
				'Caller should have checked that index was in bounds',
			);
		}
		if (count < 0 || index + count > localName.length) {
			throw new Error(
				'Caller should have checked that count was in bounds',
			);
		}

		const tryGetValueResult = tryGetValue(
			this.names,
			localName.substring(index, index + count),
		);
		if (tryGetValueResult.ok) {
			return tryGetValueResult.val;
		}

		const name = new XName(this, localName.substring(index, index + count));
		this.names.set(localName.substring(index, index + count), name);
		return name;
	}

	toString(): string {
		return this.namespaceName;
	}
}
