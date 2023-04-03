import { XNamespace } from './XNamespace';

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
