import { LoadOptions } from './XLinq';
import { XObject } from './XObject';
import { XmlReaderSettings } from './XmlReaderSettings';

// https://source.dot.net/#System.Private.Xml.Linq/System/Xml/Linq/XNode.cs,2137ed2a1146d569,references
export abstract class XNode extends XObject {
	/** @internal */ next?: XNode;

	/** @internal */ static getXmlReaderSettings(
		o: LoadOptions,
	): XmlReaderSettings {
		const rs = new XmlReaderSettings();
		if ((o & LoadOptions.PreserveWhitespace) === 0) {
			rs.ignoreWhitespace = true;
		}

		// DtdProcessing.Parse; Parse is not defined in the public contract
		// TODO: rs.dtdProcessing = 2;
		// TODO: rs.maxCharactersFromEntities = 1e7;
		return rs;
	}

	/** @internal */ abstract cloneNode(): XNode;
}
