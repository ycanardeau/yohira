import { XNode } from './XNode';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XComment.cs,378b54c573097ec7,references
export class XComment extends XNode {
	constructor(/** @internal */ public value: string) {
		super();
	}

	cloneNode(): XNode {
		throw new Error('Method not implemented.');
	}
}
