import { LoadOptions, SaveOptions } from './XLinq';
import { XObject } from './XObject';
import { XmlReaderSettings } from './XmlReader';
import { NamespaceHandling, XmlWriter, XmlWriterSettings } from './XmlWriter';

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

	/** @internal */ static getXmlWriterSettings(
		o: SaveOptions,
	): XmlWriterSettings {
		const ws = new XmlWriterSettings();
		if ((o & SaveOptions.DisableFormatting) === 0) {
			ws.indent = true;
		}
		if ((o & SaveOptions.OmitDuplicateNamespaces) !== 0) {
			ws.namespaceHandling |= NamespaceHandling.OmitDuplicates;
		}
		return ws;
	}

	abstract writeTo(writer: XmlWriter): void;

	/** @internal */ abstract cloneNode(): XNode;
}
