import { TextWriter } from './TextWriter';
import {
	XmlEncodedRawTextWriter,
	XmlEncodedRawTextWriterIndent,
} from './XmlEncodedRawTextWriter';
import { XmlError } from './XmlError';
import { XmlWellFormedWriter } from './XmlWellFormedWriter';
import { XmlWriter } from './XmlWriter';

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/NamespaceHandling.cs,e4310df963ff2e7c,references
export enum NamespaceHandling {
	//
	// Default behavior
	//
	Default = 0x0,
	//
	// Duplicate namespace declarations will be removed
	//
	OmitDuplicates = 0x1,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriterSettings.cs,a303dd5ace0c84e7,references
enum XmlOutputMethod {
	Xml = 0, // Use Xml 1.0 rules to serialize
	Html = 1, // Use Html rules specified by Xslt specification to serialize
	Text = 2, // Only serialize text blocks
	AutoDetect = 3, // Choose between Xml and Html output methods at runtime (using Xslt rules to do so)
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriterSettings.cs,433cb2f7bb17fe95,references
/**
 * Three-state logic enumeration.
 */
enum TriState {
	Unknown = -1,
	False = 0,
	True = 1,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriterSettings.cs,3e876ef4a0935e86,references
export enum XmlStandalone {
	// Do not change the constants - XmlBinaryWriter depends in it
	Omit = 0,
	Yes = 1,
	No = 2,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/ConformanceLevel.cs,9282f93eb4403e2b,references
export enum ConformanceLevel {
	// With conformance level Auto an XmlReader or XmlWriter automatically determines whether in incoming XML is an XML fragment or document.
	Auto = 0,
	// Conformance level for XML fragment. An XML fragment can contain any node type that can be a child of an element,
	// plus it can have a single XML declaration as its first node
	Fragment = 1,
	// Conformance level for XML document as specified in XML 1.0 Specification
	Document = 2,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWriterSettings.cs,ff9751984c5b1c38,references
export class XmlWriterSettings {
	/** @internal */ static readonly defaultWriterSettings =
		((): XmlWriterSettings => {
			const settings = new XmlWriterSettings();
			settings.readOnly = true;
			return settings;
		})();

	private _omitXmlDecl = false;
	private _closeOutput = false;
	private _namespaceHandling = NamespaceHandling.Default;
	private _conformanceLevel = ConformanceLevel.Document;
	private _writeEndDocumentOnClose = false;

	/** @internal */ indentInternal = TriState.Unknown;

	// Specifies the method (Html, Xml, etc.) that will be used to serialize the result tree.
	outputMethod = XmlOutputMethod.Xml;

	private initialize(): void {
		this.indentInternal = TriState.Unknown;
		this._namespaceHandling = NamespaceHandling.Default;
		this._conformanceLevel = ConformanceLevel.Document;
		this.outputMethod = XmlOutputMethod.Xml;
	}

	constructor() {
		this.initialize();
	}

	/** @internal */ readOnly = false;

	private checkReadOnly(propertyName: string): void {
		if (this.readOnly) {
			throw new XmlError(
				`The 'XmlWriterSettings.${propertyName}' property is read only and cannot be set.` /* LOC */,
			);
		}
	}

	get omitXmlDeclaration(): boolean {
		return this._omitXmlDecl;
	}
	set omitXmlDeclaration(value: boolean) {
		this.checkReadOnly('omitXmlDeclaration');
		this._omitXmlDecl = value;
	}

	get indent(): boolean {
		return this.indentInternal === TriState.True;
	}
	set indent(value: boolean) {
		this.checkReadOnly('indent');
		this.indentInternal = value ? TriState.True : TriState.False;
	}

	// Whether or not the XmlWriter should close the underlying stream or TextWriter when Close is called on the XmlWriter.
	get closeOutput(): boolean {
		return this._closeOutput;
	}
	set closeOutput(value: boolean) {
		this.checkReadOnly('closeOutput');
		this._closeOutput = value;
	}

	// Conformance
	// See ConformanceLevel enum for details.
	get conformanceLevel(): ConformanceLevel {
		return this._conformanceLevel;
	}
	set conformanceLevel(value: ConformanceLevel) {
		this.checkReadOnly('conformanceLevel');

		if (value > ConformanceLevel.Document) {
			throw new Error(
				'Specified argument was out of the range of valid values.' /* LOC */,
			);
		}
		this._conformanceLevel = value;
	}

	// Whether or not to remove duplicate namespace declarations
	get namespaceHandling(): NamespaceHandling {
		return this._namespaceHandling;
	}
	set namespaceHandling(value: NamespaceHandling) {
		this.checkReadOnly('namespaceHandling');
		// TODO
		this._namespaceHandling = value;
	}

	//Whether or not to auto complete end-element when close/dispose
	get writeEndDocumentOnClose(): boolean {
		return this._writeEndDocumentOnClose;
	}
	set writeEndDocumentOnClose(value: boolean) {
		this.checkReadOnly('writeEndDocumentOnClose');
		this._writeEndDocumentOnClose = value;
	}

	/** @internal */ createWriter(output: TextWriter): XmlWriter {
		let writer: XmlWriter;

		switch (this.outputMethod) {
			case XmlOutputMethod.Xml:
				writer = this.indent
					? new XmlEncodedRawTextWriterIndent(output, this)
					: new XmlEncodedRawTextWriter(output, this);
				break;
			case XmlOutputMethod.Html:
				// TODO
				throw new Error('Method not implemented.');
			case XmlOutputMethod.Text:
				// TODO
				throw new Error('Method not implemented.');
			case XmlOutputMethod.AutoDetect:
				// TODO
				throw new Error('Method not implemented.');
			default:
				throw new Error('Invalid XmlOutputMethod setting.');
		}

		// TODO

		// wrap with well-formed writer
		writer = new XmlWellFormedWriter(writer, this);

		// TODO
		return writer;
	}
}
