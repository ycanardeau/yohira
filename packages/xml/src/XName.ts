import { IEquatable, getStringHashCode } from '@yohira/base';

import { XNamespace } from './XNamespace';
import { verifyNCName } from './XmlConvert';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XName.cs,59294fe8612c95b2,references
export class XName implements IEquatable<XName> {
	private readonly _localName: string;
	private readonly hashCode: number;

	/** @internal */ constructor(
		private readonly ns: XNamespace,
		localName: string,
	) {
		this._localName = verifyNCName(localName);
		this.hashCode =
			getStringHashCode(ns.toString()) ^ getStringHashCode(localName);
	}

	static get(expandedName: string): XName {
		if (expandedName[0] === '{') {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			return XNamespace.none.getName(
				expandedName,
				0,
				expandedName.length,
			);
		}
	}

	get localName(): string {
		return this._localName;
	}

	get namespace(): XNamespace {
		return this.ns;
	}

	get namespaceName(): string {
		return this.ns.namespaceName;
	}

	equals(other: XName): boolean {
		return this === other; /* REVIEW */
	}
}
