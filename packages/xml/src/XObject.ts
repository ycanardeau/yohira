import { XContainer } from './XNode';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XObject.cs,909d07342e6af8b6,references
export abstract class XObject {
	/** @internal */ parent?: XContainer;
}
