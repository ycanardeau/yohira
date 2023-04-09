import { XNode } from './XNode';
import { XmlWriter } from './XmlWriter';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XComment.cs,378b54c573097ec7,references
export class XComment extends XNode {
	constructor(/** @internal */ public value: string) {
		super();
	}

	writeTo(writer: XmlWriter): void {
		writer.writeComment(this.value);
	}

	cloneNode(): XNode {
		throw new Error('Method not implemented.');
	}
}
