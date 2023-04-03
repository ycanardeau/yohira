import { TextReader } from './TextReader';
import { XmlError } from './XmlError';
import { XmlNameTable } from './XmlNameTable';
import { XmlReader } from './XmlReader';
import { XmlResolver } from './XmlResolver';
import { XmlTextReaderImpl } from './XmlTextReaderImpl';

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlReaderSettings.cs,cb30a8c80b6c7ba8,references
export class XmlReaderSettings {
	/** @internal */ static readonly defaultReaderSettings =
		((): XmlReaderSettings => {
			const settings = new XmlReaderSettings();
			settings.readOnly = true;
			return settings;
		})();
	private _nameTable?: XmlNameTable;
	private _xmlResolver?: XmlResolver;
	private _maxCharactersInDocument = 0;
	private _maxCharactersFromEntities = 0;
	private _ignoreWhitespace = false;
	private _ignoreComments = false;

	/** @internal */ readOnly = false;

	private initialize(): void {
		this._ignoreWhitespace = false;
		this.readOnly = false;
	}

	constructor() {
		this.initialize();
	}

	private checkReadOnly(propertyName: string): void {
		if (this.readOnly) {
			throw new XmlError(
				`The 'XmlReaderSettings.${propertyName}' property is read only and cannot be set.` /* LOC */,
			);
		}
	}

	get nameTable(): XmlNameTable | undefined {
		return this._nameTable;
	}
	set nameTable(value: XmlNameTable | undefined) {
		this.checkReadOnly('nameTable');
		this._nameTable = value;
	}

	/** @internal */ getXmlResolver(): XmlResolver | undefined {
		return this._xmlResolver;
	}

	get maxCharactersInDocument(): number {
		return this._maxCharactersInDocument;
	}
	set maxCharactersInDocument(value: number) {
		this.checkReadOnly('maxCharactersInDocument');
		if (value < 0) {
			throw new Error(/* TODO: message */);
		}
		this._maxCharactersInDocument = value;
	}

	get maxCharactersFromEntities(): number {
		return this._maxCharactersFromEntities;
	}
	set maxCharactersFromEntities(value: number) {
		this.checkReadOnly('maxCharactersFromEntities');
		if (value < 0) {
			throw new Error(/* TODO: message */);
		}
		this._maxCharactersFromEntities = value;
	}

	get ignoreWhitespace(): boolean {
		return this._ignoreWhitespace;
	}
	set ignoreWhitespace(value: boolean) {
		this.checkReadOnly('ignoreWhitespace');
		this._ignoreWhitespace = value;
	}

	get ignoreComments(): boolean {
		return this._ignoreComments;
	}
	set ignoreComments(value: boolean) {
		this.checkReadOnly('ignoreComments');
		this.ignoreComments = value;
	}

	/** @internal */ createReader(
		input: TextReader,
		baseUriString: string | undefined,
		// TODO: inputContext: XmlParserContext | undefined
	): XmlReader {
		baseUriString ??= '';

		// create xml text reader
		const reader = XmlTextReaderImpl.create(
			input,
			this,
			baseUriString,
			// TODO: inputContext,
		);

		// TODO

		return reader;
	}
}
