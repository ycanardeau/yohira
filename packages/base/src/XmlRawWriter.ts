import { WriteState, XmlWriter } from './XmlWriter';
import { ConformanceLevel, XmlStandalone } from './XmlWriterSettings';

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlRawWriter.cs,0fee6820237b2b99,references
export abstract class XmlRawWriter extends XmlWriter {
	/** @internal */ get supportsNamespaceDeclarationInChunks(): boolean {
		return false;
	}

	/** @internal */ writeXmlDeclaration(standalone: XmlStandalone): void {}

	// Called after an element's attributes have been enumerated, but before any children have been
	// enumerated.  This method must always be called, even for empty elements.
	/** @internal */ abstract startElementContent(): void;

	// Called before a root element is written (before the WriteStartElement call)
	//   the conformanceLevel specifies the current conformance level the writer is operating with.
	/** @internal */ onRootElement(conformancelevel: ConformanceLevel): void {}

	// This method must be called instead of WriteStartAttribute() for namespaces.
	/** @internal */ abstract writeNamespaceDeclaration(
		prefix: string,
		ns: string,
	): void;

	// Raw writers do not have to keep a stack of element names.
	writeEndElement(): void {
		throw new Error(
			'Operation is not valid due to the current state of the object.' /* LOC */,
		);
	}

	// Raw writers do not have to keep a stack of element names.
	writeFullEndElement(): void {
		throw new Error(
			'Operation is not valid due to the current state of the object.' /* LOC */,
		);
	}

	/** @internal */ abstract writeEndElementWithFullName(
		prefix: string,
		localName: string,
		ns: string,
	): void;

	/** @internal */ writeFullEndElementWithFullName(
		prefix: string,
		localName: string,
		ns: string,
	): void {
		this.writeEndElementWithFullName(prefix, localName, ns);
	}

	// Raw writers do not have to keep track of write states.
	get writeState(): WriteState {
		throw new Error(
			'Operation is not valid due to the current state of the object.' /* LOC */,
		);
	}

	// This is called when the remainder of a base64 value should be output.
	/** @internal */ writeEndBase64(): void {
		// The Flush will call WriteRaw to write out the rest of the encoded characters
		// TODO
		throw new Error('Method not implemented.');
	}

	/** @internal */ closeWithWriteState(currentState: WriteState): void {
		this.close();
	}
}
