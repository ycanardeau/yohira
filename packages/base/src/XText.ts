import { XNode } from './XNode';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XText.cs,7dcfc7339b56ed0a,references
export class XText extends XNode {
	constructor(/** @internal */ public text: string) {
		super();
	}

	cloneNode(): XNode {
		// TODO
		throw new Error('Method not implemented.');
	}
}
