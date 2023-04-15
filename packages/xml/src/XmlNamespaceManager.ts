import { XmlNameTable } from './XmlNameTable';
import { XmlReservedNs } from './XmlReservedNs';

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlNamespacemanager.cs,0d78e06001a78a31,references
class NamespaceDeclaration {
	prefix: string = undefined!;
	uri?: string;
	scopeId = 0;
	previousNsIndex = 0;

	set(
		prefix: string,
		uri: string,
		scopeId: number,
		previousNsIndex: number,
	): void {
		this.prefix = prefix;
		this.uri = uri;
		this.scopeId = scopeId;
		this.previousNsIndex = previousNsIndex;
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlNamespacemanager.cs,5fdaa3592f8f8845,references
export class XmlNamespaceManager {
	// array with namespace declarations
	private nsdecls: NamespaceDeclaration[] | undefined;

	// index of last declaration
	private lastDecl: number;

	// ID (depth) of the current scope
	private scopeId = 0;

	// hash table for faster lookup when there is lots of namespaces
	private useHashtable = false;

	// atomized prefixes for "xml" and "xmlns"
	private readonly xml: string | undefined;
	private readonly xmlNs: string | undefined;

	// Constants
	static readonly minDeclsCountForHashtable = 16;

	constructor(private readonly nameTable: XmlNameTable) {
		this.xml = nameTable.addString('xml')!;
		this.xmlNs = nameTable.addString('xmlns')!;

		this.nsdecls = new Array(8);
		for (let i = 0; i < this.nsdecls.length; i++) {
			this.nsdecls[i] = new NamespaceDeclaration();
		}
		const emptyStr = nameTable.addString('')!;
		this.nsdecls[0].set(emptyStr, emptyStr, -1, -1);
		this.nsdecls[1].set(
			this.xmlNs,
			nameTable.addString(XmlReservedNs.NsXmlNs)!,
			-1,
			-1,
		);
		this.nsdecls[2].set(
			this.xml,
			nameTable.addString(XmlReservedNs.NsXml)!,
			0,
			-1,
		);
		this.lastDecl = 2;
		this.scopeId = 1;
	}

	pushScope(): void {
		this.scopeId++;
	}

	popScope(): boolean {
		let decl = this.lastDecl;
		if (this.scopeId === 1) {
			return false;
		}

		if (this.nsdecls === undefined) {
			throw new Error('Assertion failed.');
		}

		while (this.nsdecls[decl].scopeId === this.scopeId) {
			if (this.useHashtable) {
				// TODO
				throw new Error('Method not implemented.');
			}

			decl--;
			if (decl < 2) {
				throw new Error('Assertion failed.');
			}
		}

		this.lastDecl = decl;
		this.scopeId--;
		return true;
	}

	private lookupNamespaceDecl(prefix: string): number {
		if (this.nsdecls === undefined) {
			throw new Error('Assertion failed.');
		}

		if (this.useHashtable) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			for (let thisDecl = this.lastDecl; thisDecl >= 0; thisDecl--) {
				if (
					this.nsdecls[thisDecl].prefix === prefix &&
					this.nsdecls[thisDecl].uri !== undefined
				) {
					return thisDecl;
				}
			}
		}
		return -1;
	}

	addNamespace(prefix: string, uri: string): void {
		if (this.nameTable === undefined) {
			throw new Error('Assertion failed.');
		}
		if (this.nsdecls === undefined) {
			throw new Error('Assertion failed.');
		}
		prefix = this.nameTable.addString(prefix)!;
		uri = this.nameTable.addString(uri)!;

		if (
			this.xml === prefix /* REVIEW: Ref.equal */ &&
			uri !== XmlReservedNs.NsXml /* REVIEW: Ref.equal */
		) {
			throw new Error(
				'Prefix "xml" is reserved for use by XML and can be mapped only to namespace name "http://www.w3.org/XML/1998/namespace".' /* LOC */,
			);
		}
		if (this.xmlNs === prefix /* REVIEW: Ref.equal */) {
			throw new Error(
				'Prefix "xmlns" is reserved for use by XML.' /* LOC */,
			);
		}

		const declIndex = this.lookupNamespaceDecl(prefix);
		let previousDeclIndex = -1;
		if (declIndex !== -1) {
			if (this.nsdecls[declIndex].scopeId === this.scopeId) {
				// redefine if in the same scope
				this.nsdecls[declIndex].uri = uri;
				return;
			} else {
				// otherwise link
				previousDeclIndex = declIndex;
			}
		}

		// set new namespace declaration
		if (this.lastDecl === this.nsdecls.length - 1) {
			const newNsdecls: NamespaceDeclaration[] = new Array(
				this.nsdecls.length * 2,
			);
			for (let i = 0; i < this.nsdecls.length; i++) {
				newNsdecls[i] = this.nsdecls[i];
			}
			this.nsdecls = newNsdecls;
		}

		this.nsdecls[++this.lastDecl].set(
			prefix,
			uri,
			this.scopeId,
			previousDeclIndex,
		);

		// add to hashTable
		if (this.useHashtable) {
			// TODO
			throw new Error('Method not implemented.');
		}
		// or create a new hashTable if the threshold has been reached
		else if (
			this.lastDecl >= XmlNamespaceManager.minDeclsCountForHashtable
		) {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	lookupNamespace(prefix: string): string | undefined {
		if (this.nsdecls === undefined) {
			throw new Error('Assertion failed.');
		}
		const declIndex = this.lookupNamespaceDecl(prefix);
		return declIndex === -1 ? undefined : this.nsdecls[declIndex].uri;
	}
}
