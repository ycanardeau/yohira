import {
	IDisposable,
	Out,
	Ref,
	StringBuilder,
	TextReader,
	getStringHashCode,
} from '@yohira/base';

import {
	isAttributeValueChar,
	isCharData,
	isNCNameSingleChar,
	isNameSingleChar,
	isStartNCNameSingleChar,
	isTextChar,
	isWhiteSpace,
} from './XmlCharType';
import { XmlError } from './XmlError';
import { XmlNameTable } from './XmlNameTable';
import { XmlNamespaceManager } from './XmlNamespaceManager';
import { XmlNodeType } from './XmlNodeType';
import { XmlReservedNs } from './XmlReservedNs';
import { XmlResolver } from './XmlResolver';

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlReaderSettings.cs,cb30a8c80b6c7ba8,references
export class XmlReaderSettings {
	/** @internal */ static readonly defaultReaderSettings =
		((): XmlReaderSettings => {
			const settings = new XmlReaderSettings();
			settings.readOnly = true;
			return settings;
		})();
	private _nameTable: XmlNameTable | undefined;
	private _xmlResolver: XmlResolver | undefined;
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

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/ReadState.cs,aa34e54fa5d9e054,references
// Specifies the state of the XmlReader.
export enum ReadState {
	// The Read method has not been called yet.
	Initial = 0,
	// Reading is in progress.
	Interactive = 1,
	// An error occurred that prevents the XmlReader from continuing.
	Error = 2,
	// The end of the stream has been reached successfully.
	EndOfFile = 3,
	// The Close method has been called and the XmlReader is closed.
	Closed = 4,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlReader.cs,086471e5cca0825f,references
export abstract class XmlReader implements IDisposable {
	static readonly defaultBufferSize = 4096;

	// Chosen to be small enough that the character buffer in XmlTextReader when using Async = true
	// is not allocated on the Large Object Heap (LOH)
	static readonly asyncBufferSize = 32 * 1024;

	static create(
		input: TextReader,
		settings: XmlReaderSettings | undefined,
		baseUri?: string,
	): XmlReader {
		settings ??= XmlReaderSettings.defaultReaderSettings;
		return settings.createReader(input, baseUri /* TODO: , undefined */);
	}

	// Node Properties
	// Get the type of the current node.
	abstract get nodeType(): XmlNodeType;

	// Gets the name of the current node without the namespace prefix.
	abstract get localName(): string;

	// Gets the namespace URN (as defined in the W3C Namespace Specification) of the current namespace scope.
	abstract get namespaceURI(): string;

	// Gets the namespace prefix associated with the current node.
	abstract get prefix(): string;

	// Gets the text value of the current node.
	abstract get value(): string;

	// Gets a value indicating whether the current node is an empty element (for example, <MyElement/>).
	abstract get isEmptyElement(): boolean;

	// Moves to the first attribute of the current node.
	abstract moveToFirstAttribute(): boolean;

	// Moves to the next attribute.
	abstract moveToNextAttribute(): boolean;

	// Moves to the element that contains the current attribute node.
	abstract moveToElement(): boolean;

	abstract read(): boolean;

	// Returns true when the XmlReader is positioned at the end of the stream.
	abstract get eof(): boolean;

	// Returns the read state of the XmlReader.
	abstract get readState(): ReadState;

	moveToContent(): XmlNodeType {
		do {
			switch (this.nodeType) {
				case XmlNodeType.Attribute:
					this.moveToElement();
					return this.nodeType;
				case XmlNodeType.Element:
				case XmlNodeType.EndElement:
				case XmlNodeType.CDATA:
				case XmlNodeType.Text:
				case XmlNodeType.EntityReference:
				case XmlNodeType.EndEntity:
					return this.nodeType;
			}
		} while (this.read());
		return this.nodeType;
	}

	[Symbol.dispose](): void {
		// TODO
		//throw new Error('Method not implemented.');
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlTextReaderImpl.cs,86f8752a8c2289b2,references
enum InitInputType {
	UriString,
	Stream,
	TextReader,
	Invalid,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlTextReaderImpl.cs,b45358b8870b6cea,references
class LaterInitParam {
	useAsync = false;

	inputTextReader: TextReader | undefined;

	initType = InitInputType.Invalid;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlTextReaderImplHelpers.cs,cb2c6559bbbbcd7c,references
class ParsingState {
	// character buffer
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	/** @internal */ chars: number[] = undefined!;
	/** @internal */ charPos = 0;
	/** @internal */ charsUsed = 0;
	/** @internal */ appendMode = false;

	// TODO

	// input text reader
	/** @internal */ textReader: TextReader | undefined;

	// current line number & position
	/** @internal */ lineNo = 0;
	/** @internal */ lineStartPos = 0;

	// TODO

	// eof flag of the entity
	/** @internal */ isEof = false;

	// TODO

	// normalization
	/** @internal */ eolNormalized = false;

	// TODO

	/** @internal */ get linePos(): number {
		return this.charPos - this.lineStartPos;
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/LineInfo.cs,f2336d0098e4f428,references
class LineInfo {
	constructor(
		/** @internal */ public lineNo: number,
		/** @internal */ public linePos: number,
	) {}

	set(lineNo: number, linePos: number): void {
		this.lineNo = lineNo;
		this.linePos = linePos;
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlTextReaderImplHelpers.cs,c746f918c81939cd,references
class NodeData {
	// TODO

	// type
	/** @internal */ type = XmlNodeType.None;

	// name
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	/** @internal */ localName: string = undefined!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	/** @internal */ prefix: string = undefined!;
	/** @internal */ ns: string | undefined;
	/** @internal */ nameWPrefix: string | undefined;

	// value:
	// value == null -> the value is kept in the 'chars' buffer starting at valueStartPos and valueLength long
	private value: string | undefined;
	private chars: number[] | undefined;
	private valueStartPos = 0;
	private valueLength = 0;
	// TODO

	// main line info
	/** @internal */ lineInfo = new LineInfo(0, 0);

	// second line info
	/** @internal */ lineInfo2 = new LineInfo(0, 0);

	// quote char for attributes
	/** @internal */ quoteChar = 0;

	// depth
	/** @internal */ depth = 0;

	// empty element / default attribute
	private isEmptyOrDefault = false;

	// TODO

	// helper members
	/** @internal */ xmlContextPushed = false;

	// attribute value chunks
	/** @internal */ nextAttrValueChunk: NodeData | undefined;

	// TODO

	/** @internal */ get isEmptyElement(): boolean {
		return this.type === XmlNodeType.Element && this.isEmptyOrDefault;
	}
	/** @internal */ set isEmptyElement(value: boolean) {
		if (this.type !== XmlNodeType.Element) {
			throw new Error('Assertion failed.');
		}
		this.isEmptyOrDefault = value;
	}

	/** @internal */ get isDefaultAttribute(): boolean {
		return this.type === XmlNodeType.Attribute && this.isEmptyOrDefault;
	}
	/** @internal */ set isDefaultAttribute(value: boolean) {
		if (this.type !== XmlNodeType.Attribute) {
			throw new Error('Assertion failed.');
		}
		this.isEmptyOrDefault = value;
	}

	/** @internal */ get stringValue(): string {
		if (this.valueStartPos < 0 && this.value === undefined) {
			throw new Error('Value not ready.');
		}

		if (this.value === undefined) {
			if (this.chars === undefined) {
				throw new Error('Assertion failed.');
			}
			this.value = String.fromCharCode(
				...this.chars.slice(
					this.valueStartPos,
					this.valueStartPos + this.valueLength,
				),
			);
		}
		return this.value;
	}

	/** @internal */ setString(value: string): void {
		this.valueStartPos = -1;
		this.value = value;
	}

	/** @internal */ setChars(
		chars: number[],
		startPos: number,
		len: number,
	): void {
		this.value = undefined;
		this.chars = chars;
		this.valueStartPos = startPos;
		this.valueLength = len;
	}

	/** @internal */ onBufferInvalidated(): void {
		if (this.value === undefined) {
			if (this.valueStartPos === -1) {
				throw new Error('Assertion failed.');
			}
			if (this.chars === undefined) {
				throw new Error('Assertion failed.');
			}
			// OPTIMIZE
			this.value = String.fromCharCode(
				...this.chars.slice(
					this.valueStartPos,
					this.valueStartPos + this.valueLength,
				),
			);
		}
		this.valueStartPos = -1;
	}

	/** @internal */ clearName(): void {
		this.localName = '';
		this.prefix = '';
		this.ns = '';
		this.nameWPrefix = '';
	}

	/** @internal */ clear(type: XmlNodeType): void {
		this.type = type;
		this.clearName();
		this.value = '';
		this.valueStartPos = -1;
		// TODO: this.schemaType = undefined;
		// TODO: this.typedValue = undefined;
	}

	/** @internal */ setLineInfo(lineNo: number, linePos: number): void {
		this.lineInfo.set(lineNo, linePos);
	}

	/** @internal */ setLineInfo2(lineNo: number, linePos: number): void {
		this.lineInfo2.set(lineNo, linePos);
	}

	/** @internal */ setValueNode(
		type: XmlNodeType,
		chars: number[],
		startPos: number,
		len: number,
	): void {
		this.type = type;
		this.clearName();

		this.value = undefined;
		this.chars = chars;
		this.valueStartPos = startPos;
		this.valueLength = len;
	}

	/** @internal */ setNamedNode(
		type: XmlNodeType,
		localName: string,
		prefix: string,
		nameWPrefix: string | undefined,
	): void {
		if (localName === undefined) {
			throw new Error('Assertion failed.');
		}
		if (localName.length === 0) {
			throw new Error('Assertion failed.');
		}

		this.type = type;
		this.localName = localName;
		this.prefix = prefix;
		this.nameWPrefix = nameWPrefix;
		this.ns = '';
		this.value = '';
		this.valueStartPos = -1;
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlTextReaderImpl.cs,b1c0726081f43d31,references
enum ParsingFunction {
	ElementContent = 0,
	NoData,
	OpenUrl,
	SwitchToInteractive,
	SwitchToInteractiveXmlDecl,
	DocumentContent,
	MoveToElementContent,
	PopElementContext,
	PopEmptyElementContext,
	ResetAttributesRootLevel,
	Error,
	Eof,
	ReaderClosed,
	EntityReference,
	InIncrementalRead,
	FragmentAttribute,
	ReportEndEntity,
	AfterResolveEntityInContent,
	AfterResolveEmptyEntityInContent,
	XmlDeclarationFragment,
	GoToEof,
	PartialTextValue,

	// these two states must be last; see InAttributeValueIterator property
	InReadAttributeValue,
	InReadValueChunk,
	InReadContentAsBinary,
	InReadElementContentAsBinary,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlTextReaderImpl.cs,7523932d6623387a,references
enum ParsingMode {
	Full,
	SkipNode,
	SkipContent,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlSpace.cs,eae9e92bee351c10,references
// An enumeration for the xml:space scope used in XmlReader and XmlWriter.
enum XmlSpace {
	// xml:space scope has not been specified.
	None = 0,
	// The xml:space scope is "default".
	Default = 1,
	// The xml:space scope is "preserve".
	Preserve = 2,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlTextReaderImplHelpers.cs,24bae22b54f18036,references
class XmlContext {
	private constructor(
		/** @internal */ public xmlSpace: XmlSpace,
		/** @internal */ public xmlLang: string,
		/** @internal */ public defaultNamespace: string,
		/** @internal */ public previousContext?: XmlContext,
	) {}

	static create(): XmlContext {
		return new XmlContext(XmlSpace.None, '', '', undefined);
	}

	static fromXmlContext(previousContext: XmlContext): XmlContext {
		return new XmlContext(
			previousContext.xmlSpace,
			previousContext.xmlLang,
			previousContext.defaultNamespace,
			previousContext,
		);
	}
}

class NameTableEntry {
	/** @internal */ constructor(
		/** @internal */ public str: string,
		/** @internal */ public hashCode: number,
		/** @internal */ public next: NameTableEntry | undefined,
	) {}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/NameTable.cs,c71b9d3a7bc2d2af,references
class NameTable extends XmlNameTable {
	private entries: (NameTableEntry | undefined)[];
	private count = 0;
	private mask: number;

	constructor() {
		super();

		this.mask = 31;
		this.entries = new Array(this.mask + 1);
	}

	/** @internal */ static computeHash32(key: string): number {
		return getStringHashCode(key);
	}

	getString(value: string): string | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	private grow(): void {
		const newMask = this.mask * 2 + 1;
		const oldEntries = this.entries;
		const newEntries: (NameTableEntry | undefined)[] = new Array(
			newMask + 1,
		);

		for (let i = 0; i < oldEntries.length; i++) {
			let e = oldEntries[i];
			while (e !== undefined) {
				const newIndex = e.hashCode & newMask;
				const tmp = e.next;
				e.next = newEntries[newIndex];
				newEntries[newIndex] = e;
				e = tmp;
			}
		}

		this.entries = newEntries;
		this.mask = newMask;
	}

	private addEntry(str: string, hashCode: number): string {
		const index = hashCode & this.mask;
		const e = new NameTableEntry(str, hashCode, this.entries[index]);
		this.entries[index] = e;

		if (this.count++ === this.mask) {
			this.grow();
		}

		return e.str;
	}

	addString(key: string): string | undefined {
		const len = key.length;
		if (len === 0) {
			return '';
		}

		const hashCode = NameTable.computeHash32(key);

		for (
			const e = this.entries[hashCode & this.mask];
			e !== undefined;
			e.next
		) {
			if (e.hashCode === hashCode && e.str === key) {
				return e.str;
			}
		}

		return this.addEntry(key, hashCode);
	}

	addChars(key: number[], start: number, len: number): string {
		if (len === 0) {
			return '';
		}

		// Compatibility check to ensure same exception as previous versions
		// independently of any exceptions throw by the hashing function.
		// note that NullReferenceException is the first one if key is null.
		if (start >= key.length || start < 0 || start + len > key.length) {
			throw new Error(
				'Index was outside the bounds of the array.' /* LOC */,
			);
		}

		// Compatibility check for len < 0, just throw the same exception as new string(key, start, len)
		if (len < 0) {
			throw new Error(
				`len ('${len}') must be a non-negative value.` /* LOC */,
			);
		}

		const hashCode = getStringHashCode(
			String.fromCharCode(...key.slice(start, start + len)),
		);

		for (
			let e = this.entries[hashCode & this.mask];
			e !== undefined;
			e = e.next
		) {
			if (
				e.hashCode === hashCode &&
				e.str === String.fromCharCode(...key.slice(start, start + len))
			) {
				return e.str;
			}
		}

		return this.addEntry(
			String.fromCharCode(...key.slice(start, start + len)),
			hashCode,
		);
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/WhitespaceHandling.cs,7997ac02cb0308ea,references
// Specifies how whitespace is handled in XmlTextReader.
enum WhitespaceHandling {
	// Return all Whitespace and SignificantWhitespace nodes. This is the default.
	All = 0,
	// Return just SignificantWhitespace, i.e. whitespace nodes that are in scope of xml:space="preserve"
	Significant = 1,
	// Do not return any Whitespace or SignificantWhitespace nodes.
	None = 2,
}

const approxXmlDeclLength = 80;
const nodesInitialSize = 8;
const maxAttrDuplWalkCount = 250;

const xmlDeclarationBeginning = '<?xml';

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlTextReaderImpl.cs,af5cfe6df03d2864,references
export class XmlTextReaderImpl extends XmlReader {
	private laterInitParam: LaterInitParam | undefined;

	// current parsing state (aka. scanner data)
	private ps = new ParsingState();

	// parsing function = what to do in the next read() (3-items-long stack, usually used just 2 level)
	private parsingFunction: ParsingFunction;
	private nextParsingFunction: ParsingFunction;
	// TODO

	// xml context (xml:space, xml:lang, default namespace)
	private xmlContext: XmlContext;

	// stack of nodes
	private nodes: NodeData[];

	// current node
	private curNode: NodeData;

	// current index
	private index = 0;

	// attributes info
	private curAttrIndex = -1;
	private attrCount = 0;
	private attrHashtable = 0;
	private attrDuplWalkCount = 0;
	private attrNeedNamespaceLookup = false;
	private fullAttrCleanup = false;
	// TODO

	// TODO

	// name table
	private nameTable: XmlNameTable;
	private nameTableFromSettings = false;

	// TODO

	// settings
	// TODO
	private supportNamespaces = true;
	private whitespaceHandling: WhitespaceHandling;
	// TODO
	private readonly ignoreComments: boolean;
	// TODO
	private readonly maxCharactersInDocument: number;
	private readonly maxCharactersFromEntities: number;
	// TODO

	// this flag enables XmlTextReader backwards compatibility;
	// when false, the reader has been created via XmlReader.Create
	private readonly v1Compat: boolean;

	// namespace handling
	private namespaceManager: XmlNamespaceManager | undefined;
	private lastPrefix = '';

	// TODO

	// stack of parsing states (=stack of entities)
	// TODO
	private parsingStatesStackTop = -1;

	// current node base uri and encoding
	private reportedBaseUri = '';

	// TODO

	// fragment parsing
	private fragmentType = XmlNodeType.Document;
	// TODO

	// TODO

	// misc
	private _addDefaultAttributesAndNormalize = false;
	private readonly stringBuilder: StringBuilder;
	private rootElementParsed = false;
	// TODO
	private parsingMode = ParsingMode.Full;
	// TODO
	private _readState = ReadState.Initial;
	// TODO
	private afterResetState = false;
	// TODO

	//
	// Atomized string constants
	//
	private readonly xml: string;
	private readonly xmlNs: string;

	private constructor(
		resolver: XmlResolver | undefined,
		settings: XmlReaderSettings,
		// TODO: context: XmlParserContext | undefined
	) {
		super();

		// TODO: this.useAsync = settings.async;
		this.v1Compat = false;
		// TODO

		this.xmlContext = XmlContext.create();

		// create or get nametable and namespace manager from XmlParserContext
		let nt = settings.nameTable;
		if (true /* TODO: context === undefined */) {
			if (nt === undefined) {
				nt = new NameTable();
				if (this.nameTableFromSettings) {
					throw new Error('Assertion failed.');
				}
			} else {
				this.nameTableFromSettings = true;
			}

			this.nameTable = nt;
			this.namespaceManager = new XmlNamespaceManager(nt);
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}

		nt.addString('');
		this.xml = nt.addString('xml')!;
		this.xmlNs = nt.addString('xmlns')!;

		// TODO

		if (this.index !== 0) {
			throw new Error('Assertion failed.');
		}

		this.nodes = new Array(nodesInitialSize);
		this.nodes[0] = new NodeData();
		this.curNode = this.nodes[0];

		this.stringBuilder = new StringBuilder();

		// TODO

		this.whitespaceHandling = settings.ignoreWhitespace
			? WhitespaceHandling.Significant
			: WhitespaceHandling.All;
		// TODO
		this.ignoreComments = settings.ignoreComments;
		// TODO
		this.maxCharactersInDocument = settings.maxCharactersInDocument;
		this.maxCharactersFromEntities = settings.maxCharactersFromEntities;

		this.parsingFunction = ParsingFunction.SwitchToInteractiveXmlDecl;
		this.nextParsingFunction = ParsingFunction.DocumentContent;

		// TODO
		//throw new Error('Method not implemented.');
	}

	private initTextReaderInput(
		baseUriStr: string,
		baseUri: string | undefined,
		input: TextReader,
	): void {
		if (
			this.ps.charPos !== 0 ||
			this.ps.charsUsed !== 0
			// TODO: this.ps.stream !== undefined
		) {
			throw new Error('Assertion failed.');
		}
		if (baseUriStr === undefined) {
			throw new Error('Assertion failed.');
		}

		this.ps.textReader = input;
		// TODO: this.ps.baseUriStr = baseUriStr;
		// TODO: this.baseUri = baseUri;

		if (this.ps.chars === undefined) {
			if (
				this.laterInitParam !== undefined &&
				this.laterInitParam.useAsync
			) {
				this.ps.chars = new Array(XmlReader.asyncBufferSize + 1);
			} else {
				this.ps.chars = new Array(XmlReader.defaultBufferSize + 1);
			}
		}

		// TODO

		// read first characters
		this.ps.appendMode = true;
		this.readData();
	}

	private finishInitTextReader(): void {
		if (this.laterInitParam === undefined) {
			throw new Error('Assertion failed.');
		}
		if (this.laterInitParam.inputTextReader === undefined) {
			throw new Error('Assertion failed.');
		}
		if (this.reportedBaseUri === undefined) {
			throw new Error('Assertion failed.');
		}

		// init ParsingState
		this.initTextReaderInput(
			this.reportedBaseUri,
			undefined,
			this.laterInitParam.inputTextReader,
		);

		// TODO

		// parse DTD
		/* TODO: if (
			this.laterInitParam.inputContext !== undefined &&
			this.laterInitParam.inputContext.hasDtdInfo
		) {
			this.processDtdFromParserContext(this.laterInitParam.inputContext);
		} */

		this.laterInitParam = undefined;
	}

	/** @internal */ static create(
		input: TextReader,
		settings: XmlReaderSettings,
		baseUriStr: string,
		// TODO: context: XmlParserContext | undefined
	): XmlTextReaderImpl {
		const reader = new XmlTextReaderImpl(
			settings.getXmlResolver(),
			settings,
			// TODO: context,
		);

		reader.reportedBaseUri = baseUriStr;
		// TODO
		reader.laterInitParam = new LaterInitParam();
		reader.laterInitParam.inputTextReader = input;
		// TODO: reader.laterInitParam.inputContext = context;
		reader.laterInitParam.initType = InitInputType.TextReader;
		// TODO
		if (true /* TODO: !settings.async */) {
			//if not set Async flag, finish the init in create stage.
			reader.finishInitTextReader();
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}

		return reader;
	}

	// Returns the type of the current node.
	get nodeType(): XmlNodeType {
		return this.curNode.type;
	}

	// Returns local name of the current node (without prefix)
	get localName(): string {
		return this.curNode.localName;
	}

	// Returns namespace name of the current node.
	get namespaceURI(): string {
		return this.curNode.ns ?? '';
	}

	// Returns prefix associated with the current node.
	get prefix(): string {
		return this.curNode.prefix;
	}

	private finishPartialValue(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	private finishOtherValueIterator(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	// Returns the text value of the current node.
	get value(): string {
		if (this.parsingFunction >= ParsingFunction.PartialTextValue) {
			if (this.parsingFunction === ParsingFunction.PartialTextValue) {
				this.finishPartialValue();
				this.parsingFunction = this.nextParsingFunction;
			} else {
				this.finishOtherValueIterator();
			}
		}

		return this.curNode.stringValue;
	}

	// Returns true if the current node is an empty element (for example, <MyElement/>).
	get isEmptyElement(): boolean {
		return this.curNode.isEmptyElement;
	}

	// Returns the current read state of the reader
	get readState(): ReadState {
		return this._readState;
	}

	// Returns true if the reader reached end of the input data
	get eof(): boolean {
		return this.parsingFunction === ParsingFunction.Eof;
	}

	//
	// Private implementation methods & properties
	//
	private get inAttributeValueIterator(): boolean {
		return (
			this.attrCount > 0 &&
			this.parsingFunction >= ParsingFunction.InReadAttributeValue
		);
	}

	private finishAttributeValueIterator(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	// Moves to the first attribute of the current node
	moveToFirstAttribute(): boolean {
		if (this.attrCount === 0) {
			return false;
		}

		if (this.inAttributeValueIterator) {
			this.finishAttributeValueIterator();
		}

		this.curAttrIndex = 0;
		this.curNode = this.nodes[this.index + 1];

		return true;
	}

	// Moves to the next attribute of the current node
	moveToNextAttribute(): boolean {
		if (this.curAttrIndex + 1 < this.attrCount) {
			if (this.inAttributeValueIterator) {
				this.finishAttributeValueIterator();
			}
			this.curNode = this.nodes[this.index + 1 + ++this.curAttrIndex];
			return true;
		}
		return false;
	}

	// If on attribute, moves to the element that contains the attribute node
	moveToElement(): boolean {
		if (this.inAttributeValueIterator) {
			this.finishAttributeValueIterator();
		} else if (this.curNode.type !== XmlNodeType.Attribute) {
			return false;
		}
		this.curAttrIndex = -1;
		this.curNode = this.nodes[this.index];

		return true;
	}

	private get inEntity(): boolean {
		return this.parsingStatesStackTop >= 0;
	}

	private registerConsumedCharacters(
		characters: number,
		inEntityReference: boolean,
	): void {
		if (characters < 0) {
			throw new Error('Assertion failed.');
		}
		if (this.maxCharactersInDocument > 0) {
			// TODO
			throw new Error('Method not implemented.');
		}

		if (this.maxCharactersFromEntities > 0 && inEntityReference) {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	private static blockCopyChars(
		src: number[],
		srcOffset: number,
		dst: number[],
		dstOffset: number,
		count: number,
	): void {
		// OPTIMIZE
		for (let i = 0; i < count; i++) {
			dst[dstOffset + i] = src[srcOffset + i];
		}
	}

	// Reads more data to the character buffer, discarding already parsed chars / decoded bytes.
	private readData(): number {
		// Append Mode:  Append new bytes and characters to the buffers, do not rewrite them. Allocate new buffers
		//               if the current ones are full
		// Rewrite Mode: Reuse the buffers. If there is less than half of the char buffer left for new data, move
		//               the characters that has not been parsed yet to the front of the buffer. Same for bytes.

		if (this.ps.isEof) {
			return 0;
		}

		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}
		let charsRead = 0;
		if (this.ps.appendMode) {
			// the character buffer is full -> allocate a new one
			if (this.ps.charsUsed === this.ps.chars.length - 1) {
				// invalidate node values kept in buffer - applies to attribute values only
				for (let i = 0; i < this.attrCount; i++) {
					this.nodes[this.index + i + 1].onBufferInvalidated();
				}

				const newChars: number[] = new Array(this.ps.chars.length * 2);
				XmlTextReaderImpl.blockCopyChars(
					this.ps.chars,
					0,
					newChars,
					0,
					this.ps.chars.length,
				);
				this.ps.chars = newChars;
			}

			if (false /* TODO */) {
				// TODO
				throw new Error('Method not implemented.');
			}

			charsRead = this.ps.chars.length - this.ps.charsUsed - 1;
			if (charsRead > approxXmlDeclLength) {
				charsRead = approxXmlDeclLength;
			}
		} else {
			const charsLen = this.ps.chars.length;
			if (charsLen - this.ps.charsUsed <= charsLen / 2) {
				// invalidate node values kept in buffer - applies to attribute values only
				for (let i = 0; i < this.attrCount; i++) {
					this.nodes[this.index + i + 1].onBufferInvalidated();
				}

				// move unparsed characters to front, unless the whole buffer contains unparsed characters
				const copyCharsCount = this.ps.charsUsed - this.ps.charPos;
				if (copyCharsCount < charsLen - 1) {
					this.ps.lineStartPos -= this.ps.charPos;
					if (copyCharsCount > 0) {
						XmlTextReaderImpl.blockCopyChars(
							this.ps.chars,
							this.ps.charPos,
							this.ps.chars,
							0,
							copyCharsCount,
						);
					}
					this.ps.charPos = 0;
					this.ps.charsUsed = copyCharsCount;
				} else {
					const newChars: number[] = new Array(
						this.ps.chars.length * 2,
					);
					XmlTextReaderImpl.blockCopyChars(
						this.ps.chars,
						0,
						newChars,
						0,
						this.ps.chars.length,
					);
					this.ps.chars = newChars;
				}
			}

			if (false /* TODO */) {
				// TODO
				throw new Error('Method not implemented.');
			}
			charsRead = this.ps.chars.length - this.ps.charsUsed - 1;
		}

		if (false /* TODO */) {
			// TODO
			throw new Error('Method not implemented.');
		} else if (this.ps.textReader !== undefined) {
			// read chars
			charsRead = this.ps.textReader.read(
				this.ps.chars,
				this.ps.charsUsed,
				this.ps.chars.length - this.ps.charsUsed - 1,
			);
			this.ps.charsUsed += charsRead;
		} else {
			charsRead = 0;
		}

		this.registerConsumedCharacters(charsRead, this.inEntity);

		if (charsRead === 0) {
			if (this.ps.charsUsed >= this.ps.chars.length) {
				throw new Error('Assertion failed.');
			}
			this.ps.isEof = true;
		}

		this.ps.chars[this.ps.charsUsed] = 0;
		return charsRead;
	}

	private onNewLine(pos: number): void {
		this.ps.lineNo++;
		this.ps.lineStartPos = pos - 1;
	}

	private eatWhitespaces(sb: StringBuilder | undefined): number {
		let pos = this.ps.charPos;
		let wsCount = 0;
		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}
		const chars = this.ps.chars;

		while (true) {
			while (true) {
				switch (chars[pos]) {
					case 0xa:
						pos++;
						this.onNewLine(pos);
						continue;
					case 0xd:
						if (chars[pos + 1] === 0xa) {
							const tmp1 = pos - this.ps.charPos;
							if (sb !== undefined && !this.ps.eolNormalized) {
								if (tmp1 > 0) {
									sb.appendChars(
										chars,
										this.ps.charPos,
										tmp1,
									);
									wsCount += tmp1;
								}
								this.ps.charPos = pos + 1;
							}
							pos += 2;
						} else if (
							pos + 1 < this.ps.charsUsed ||
							this.ps.isEof
						) {
							if (!this.ps.eolNormalized) {
								chars[pos] = 0xa; // EOL normalization of 0xD
							}
							pos++;
						} else {
							// TODO
							throw new Error('Method not implemented.');
						}
						this.onNewLine(pos);
						continue;
					case 0x9:
					case 0x20:
						pos++;
						continue;
					default:
						if (pos === this.ps.charsUsed) {
							// TODO
							throw new Error('Method not implemented.');
						} else {
							const tmp2 = pos - this.ps.charPos;
							if (tmp2 > 0) {
								sb?.appendChars(
									this.ps.chars,
									this.ps.charPos,
									tmp2,
								);
								this.ps.charPos = pos;
								wsCount += tmp2;
							}
							return wsCount;
						}
				}
			}

			// TODO
			throw new Error('Method not implemented.');
		}
	}

	private parseQName(
		isQName: boolean,
		startOffset: number,
		colonPos: Out<number>,
	): number {
		const colonOffset = -1;
		let pos = this.ps.charPos + startOffset;

		// TODO: ContinueStartName:
		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}
		const chars = this.ps.chars;

		// start name char
		if (isStartNCNameSingleChar(chars[pos])) {
			pos++;
		} else {
			if (pos + 1 >= this.ps.charsUsed) {
				// TODO
				throw new Error('Method not implemented.');
			}
			if (chars[pos] !== ':'.charCodeAt(0) || this.supportNamespaces) {
				// TODO
				throw new XmlError(/* TODO: message */);
			}
		}

		// TODO: ContinueName:
		// parse name
		while (true) {
			if (isNCNameSingleChar(chars[pos])) {
				pos++;
			} else {
				break;
			}
		}

		// colon
		if (chars[pos] === ':'.charCodeAt(0)) {
			// TODO
			throw new Error('Method not implemented.');
		}
		// end of buffer
		else if (pos === this.ps.charsUsed) {
			// TODO
			throw new Error('Method not implemented.');
		}

		// end of name
		colonPos.set(colonOffset === -1 ? -1 : this.ps.charPos + colonOffset);
		return pos;
	}

	private parseName(): number {
		return this.parseQName(false, 0, { set: () => {} });
	}

	private allocNode(nodeIndex: number, nodeDepth: number): NodeData {
		if (nodeIndex >= this.nodes.length) {
			throw new Error('Assertion failed.');
		}
		if (nodeIndex >= this.nodes.length - 1) {
			const newNodes: NodeData[] = new Array(this.nodes.length * 2);
			// OPTIMIZE
			for (let i = 0; i < this.nodes.length; i++) {
				newNodes[i] = this.nodes[i];
			}
			this.nodes = newNodes;
		}
		if (nodeIndex >= this.nodes.length) {
			throw new Error('Assertion failed.');
		}

		const node = (this.nodes[nodeIndex] ??= new NodeData());
		node.depth = nodeDepth;
		return node;
	}

	private addNode(nodeIndex: number, nodeDepth: number): NodeData {
		if (nodeIndex >= this.nodes.length) {
			throw new Error('Assertion failed.');
		}
		if (this.nodes[this.nodes.length - 1] !== undefined) {
			throw new Error('Assertion failed.');
		}

		const n = this.nodes[nodeIndex];
		if (n !== undefined) {
			n.depth = nodeDepth;
			return n;
		}
		return this.allocNode(nodeIndex, nodeDepth);
	}

	private addAttributeNoChecks(name: string, attrDepth: number): NodeData {
		const newAttr = this.addNode(
			this.index + this.attrCount + 1,
			attrDepth,
		);
		const localName = this.nameTable.addString(name)!;
		newAttr.setNamedNode(XmlNodeType.Attribute, localName, '', localName);
		this.attrCount++;
		return newAttr;
	}

	// Parses the xml or text declaration and switched encoding if needed
	private parseXmlDeclaration(isTextDecl: boolean): boolean {
		// HACK: goto
		class NoXmlDecl {}
		try {
			while (this.ps.charsUsed - this.ps.charPos < 6) {
				// minimum "<?xml "
				if (this.readData() === 0) {
					// HACK: goto
					throw new NoXmlDecl();
				}
			}

			if (
				// OPTIMIZE
				!String.fromCharCode(
					...this.ps.chars.slice(this.ps.charPos),
				).startsWith(xmlDeclarationBeginning) ||
				isNameSingleChar(this.ps.chars[this.ps.charPos + 5])
			) {
				// HACK: goto
				throw new NoXmlDecl();
			}

			if (!isTextDecl) {
				this.curNode.setLineInfo(this.ps.lineNo, this.ps.linePos + 2);
				const localName = this.xml;
				this.curNode.setNamedNode(
					XmlNodeType.XmlDeclaration,
					localName,
					'',
					localName,
				);
			}

			this.ps.charPos += 5;

			// parsing of text declarations cannot change global stringBuilder or curNode as we may be in the middle of a text node
			if (this.stringBuilder.length !== 0 && !isTextDecl) {
				throw new Error('Assertion failed.');
			}
			const sb = isTextDecl ? new StringBuilder() : this.stringBuilder;

			// parse version, encoding & standalone attributes
			let xmlDeclState = 0; // <?xml (0) version='1.0' (1) encoding='__' (2) standalone='__' (3) ?>
			// TODO

			while (true) {
				const originalSbLen = sb.length;
				const wsCount = this.eatWhitespaces(
					xmlDeclState === 0 ? undefined : sb,
				);

				// end of xml declaration
				if (this.ps.chars[this.ps.charPos] === '?'.charCodeAt(0)) {
					sb.length = originalSbLen;

					if (
						this.ps.chars[this.ps.charPos + 1] === '>'.charCodeAt(0)
					) {
						if (xmlDeclState === 0) {
							throw new XmlError(/* TODO: message */);
						}

						this.ps.charPos += 2;
						if (!isTextDecl) {
							this.curNode.setString(sb.toString());
							sb.length = 0;

							this.nextParsingFunction = this.parsingFunction;
							this.parsingFunction =
								ParsingFunction.ResetAttributesRootLevel;
						}

						// switch to encoding specified in xml declaration
						if (true /* TODO */) {
							if (isTextDecl) {
								throw new XmlError(
									'Invalid text declaration.' /* LOC */,
								);
							}
							// TODO
							//throw new Error('Method not implemented.');
						} else {
							// TODO
							throw new Error('Method not implemented.');
						}
						this.ps.appendMode = false;
						return true;
					} else if (this.ps.charPos + 1 === this.ps.charsUsed) {
						// TODO
						throw new Error('Method not implemented.');
					} else {
						throw new XmlError(/* TODO: message */);
					}
				}

				if (wsCount === 0 && xmlDeclState !== 0) {
					throw new XmlError(/* TODO: message */);
				}

				// read attribute name
				const nameEndPos = this.parseName();

				let attr: NodeData | undefined = undefined;
				switch (
					String.fromCharCode(
						...this.ps.chars.slice(this.ps.charPos, nameEndPos),
					)
				) {
					case 'version':
						if (xmlDeclState === 0) {
							if (!isTextDecl) {
								attr = this.addAttributeNoChecks('version', 1);
							}
							break;
						}
						// TODO
						throw new Error('Method not implemented.');
					case 'encoding':
						if (
							xmlDeclState === 1 ||
							(isTextDecl && xmlDeclState === 0)
						) {
							if (!isTextDecl) {
								attr = this.addAttributeNoChecks('encoding', 1);
							}
							xmlDeclState = 1;
							break;
						}
						// TODO
						throw new Error('Method not implemented.');
					case 'standalone':
						if (
							(xmlDeclState === 1 || xmlDeclState === 2) &&
							!isTextDecl
						) {
							attr = this.addAttributeNoChecks('standalone', 1);
							xmlDeclState = 2;
							break;
						}
						// TODO
						throw new Error('Method not implemented.');
					default:
						// TODO
						throw new Error('Method not implemented.');
				}

				if (!isTextDecl) {
					if (attr === undefined) {
						throw new Error('Assertion failed.');
					}
					attr.setLineInfo(this.ps.lineNo, this.ps.linePos);
				}
				sb.appendChars(
					this.ps.chars,
					this.ps.charPos,
					nameEndPos - this.ps.charPos,
				);
				this.ps.charPos = nameEndPos;

				// parse equals and quote char;
				if (this.ps.chars[this.ps.charPos] !== '='.charCodeAt(0)) {
					this.eatWhitespaces(sb);
					if (this.ps.chars[this.ps.charPos] !== '='.charCodeAt(0)) {
						throw new XmlError(/* TODO: message */);
					}
				}
				sb.appendChar('='.charCodeAt(0));
				this.ps.charPos++;

				let quoteChar = this.ps.chars[this.ps.charPos];
				if (
					quoteChar !== '"'.charCodeAt(0) &&
					quoteChar !== "'".charCodeAt(0)
				) {
					this.eatWhitespaces(sb);
					quoteChar = this.ps.chars[this.ps.charPos];
					if (
						quoteChar !== '"'.charCodeAt(0) &&
						quoteChar !== "'".charCodeAt(0)
					) {
						throw new XmlError(/* TODO: message */);
					}
				}
				sb.appendChar(quoteChar);
				this.ps.charPos++;
				if (!isTextDecl) {
					if (attr === undefined) {
						throw new Error('Assertion failed.');
					}
					attr.quoteChar = quoteChar;
					attr.setLineInfo2(this.ps.lineNo, this.ps.linePos);
				}

				// parse attribute value
				let pos = this.ps.charPos;
				// TODO: Continue:
				const chars = this.ps.chars;
				while (isAttributeValueChar(chars[pos])) {
					pos++;
				}

				if (this.ps.chars[pos] === quoteChar) {
					switch (xmlDeclState) {
						// version
						case 0:
							// VersionNum  ::=  '1.0'        (XML Fourth Edition and earlier)
							if (
								String.fromCharCode(
									...this.ps.chars.slice(this.ps.charPos),
								).startsWith('1.0')
							) {
								if (!isTextDecl) {
									if (attr === undefined) {
										throw new Error('Assertion failed.');
									}
									attr.setChars(
										this.ps.chars,
										this.ps.charPos,
										pos - this.ps.charPos,
									);
								}
								xmlDeclState = 1;
							} else {
								// TODO
								throw new Error('Method not implemented.');
							}
							break;
						case 1:
							const encName = String.fromCharCode(
								...this.ps.chars.slice(this.ps.charPos, pos),
							);
							// TODO: encoding = checkEncoding(encName);
							if (!isTextDecl) {
								if (attr === undefined) {
									throw new Error('Assertion failed.');
								}
								attr.setString(encName);
							}
							xmlDeclState = 2;
							break;
						case 2:
							// TODO
							throw new Error('Method not implemented.');
						default:
							// TODO
							throw new Error('Method not implemented.');
					}
					sb.appendChars(
						chars,
						this.ps.charPos,
						pos - this.ps.charPos,
					);
					sb.appendChar(quoteChar);
					this.ps.charPos = pos + 1;
					continue;
				} else if (pos === this.ps.charsUsed) {
					// TODO
					throw new Error('Method not implemented.');
				} else {
					// TODO
					throw new Error('Method not implemented.');
				}

				// TODO: ReadData:
				// TODO
				throw new Error('Method not implemented.');
			}
		} catch (error) {
			if (error instanceof NoXmlDecl) {
				// no xml declaration
				if (!isTextDecl) {
					this.parsingFunction = this.nextParsingFunction;
				}
				if (this.afterResetState) {
					// TODO
					//throw new Error('Method not implemented.');
				}
				// TODO
				//throw new Error('Method not implemented.');
				this.ps.appendMode = false;
				return false;
			} else {
				throw error;
			}
		}
	}

	private fullAttributeCleanup(): void {
		for (let i = this.index + 1; this.index + this.attrCount + 1; i++) {
			const attr = this.nodes[i];
			attr.nextAttrValueChunk = undefined;
			attr.isDefaultAttribute = false;
		}
		this.fullAttrCleanup = false;
	}

	private resetAttributes(): void {
		if (this.fullAttrCleanup) {
			this.fullAttributeCleanup();
		}

		this.curAttrIndex = -1;
		this.attrCount = 0;
		this.attrHashtable = 0;
		this.attrDuplWalkCount = 0;
	}

	private parsePI(): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}

	private addAttributeCore(
		localName: string,
		prefix: string,
		nameWPrefix: string | undefined,
	): NodeData {
		const newAttr = this.addNode(
			this.index + this.attrCount + 1,
			this.index + 1,
		);

		// set attribute name
		newAttr.setNamedNode(
			XmlNodeType.Attribute,
			localName,
			prefix,
			nameWPrefix,
		);

		// pre-check attribute for duplicate: hash by first local name char
		const attrHash = 1 << (localName.charCodeAt(0) & 0x1f);
		if ((this.attrHashtable & attrHash) === 0) {
			this.attrHashtable |= attrHash;
		} else {
			// there are probably 2 attributes beginning with the same letter -> check all previous
			// attributes
			if (this.attrDuplWalkCount < maxAttrDuplWalkCount) {
				this.attrDuplWalkCount++;
				for (
					let i = this.index + 1;
					i < this.index + this.attrCount + 1;
					i++
				) {
					const attr = this.nodes[i];
					if (attr.type !== XmlNodeType.Attribute) {
						throw new Error('Assertion failed.');
					}
					if (
						attr.localName ===
						newAttr.localName /* REVIEW: Ref.equal */
					) {
						this.attrDuplWalkCount = maxAttrDuplWalkCount;
						break;
					}
				}
			}
		}

		this.attrCount++;
		return newAttr;
	}

	private addAttribute(endNamePos: number, colonPos: number): NodeData {
		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}

		// setup attribute name
		if (colonPos === -1 || !this.supportNamespaces) {
			const localName = this.nameTable.addChars(
				this.ps.chars,
				this.ps.charPos,
				endNamePos - this.ps.charPos,
			);
			return this.addAttributeCore(localName, '', localName);
		} else {
			this.attrNeedNamespaceLookup = true;
			const startPos = this.ps.charPos;
			const prefixLen = colonPos - startPos;
			if (
				prefixLen === this.lastPrefix.length &&
				String.fromCharCode(
					...this.ps.chars.slice(this.ps.charPos),
				).startsWith(this.lastPrefix)
			) {
				return this.addAttributeCore(
					this.nameTable.addChars(
						this.ps.chars,
						colonPos + 1,
						endNamePos - colonPos - 1,
					),
					this.lastPrefix,
					undefined,
				);
			} else {
				const prefix = this.nameTable.addChars(
					this.ps.chars,
					startPos,
					prefixLen,
				);
				this.lastPrefix = prefix;
				return this.addAttributeCore(
					this.nameTable.addChars(
						this.ps.chars,
						colonPos + 1,
						endNamePos - colonPos - 1,
					),
					prefix,
					undefined,
				);
			}
		}
	}

	private parseAttributeValueSlow(
		curPos: number,
		quoteChar: number,
		attr: NodeData,
	): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	private pushXmlContext(): void {
		this.xmlContext = XmlContext.fromXmlContext(this.xmlContext);
		this.curNode.xmlContextPushed = true;
	}

	private onDefaultNamespaceDecl(attr: NodeData): void {
		if (!this.supportNamespaces) {
			return;
		}

		const ns = this.nameTable.addString(attr.stringValue)!;
		attr.ns = this.nameTable.addString(XmlReservedNs.NsXmlNs);

		if (!this.curNode.xmlContextPushed) {
			this.pushXmlContext();
		}

		this.xmlContext.defaultNamespace = ns;

		this.addNamespace('', ns, attr);
	}

	private addNamespace(prefix: string, uri: string, attr: NodeData): void {
		if (uri === XmlReservedNs.NsXmlNs) {
			// TODO
			throw new Error('Method not implemented.');
		} else if (uri === XmlReservedNs.NsXml) {
			// TODO
			throw new Error('Method not implemented.');
		}
		if (uri.length === 0 && prefix.length > 0) {
			// TODO
			throw new Error('Method not implemented.');
		}

		if (this.namespaceManager === undefined) {
			throw new Error('Assertion failed.');
		}

		try {
			this.namespaceManager.addNamespace(prefix, uri);
		} catch {
			throw new XmlError(/* TODO: message */);
		}
		if (prefix.length === 0) {
			if (this.xmlContext.defaultNamespace !== uri) {
				throw new Error('Assertion failed.');
			}
		}
	}

	private onNamespaceDecl(attr: NodeData): void {
		if (!this.supportNamespaces) {
			return;
		}
		const ns = this.nameTable.addString(attr.stringValue)!;
		if (ns.length === 0) {
			throw new XmlError(/* TODO: message */);
		}
		this.addNamespace(attr.localName, ns, attr);
	}

	private onXmlReservedAttribute(attr: NodeData): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	private addDefaultAttributesAndNormalize(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	private lookupNamespace(node: NodeData): string {
		if (this.namespaceManager === undefined) {
			throw new Error('Assertion failed.');
		}
		const ns = this.namespaceManager.lookupNamespace(node.prefix);
		if (ns !== undefined) {
			return ns;
		} else {
			throw new XmlError(/* TODO: message */);
		}
	}

	private elementNamespaceLookup(): void {
		if (this.curNode.type !== XmlNodeType.Element) {
			throw new Error('Assertion failed.');
		}
		if (this.curNode.prefix.length === 0) {
			this.curNode.ns = this.xmlContext.defaultNamespace;
		} else {
			this.curNode.ns = this.lookupNamespace(this.curNode);
		}
	}

	private attributeNamespaceLookup(): void {
		for (let i = this.index + 1; i < this.index + this.attrCount + 1; i++) {
			const at = this.nodes[i];
			if (at.type === XmlNodeType.Attribute && at.prefix.length > 0) {
				at.ns = this.lookupNamespace(at);
			}
		}
	}

	private attributeDuplCheck(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	// Reads the attributes
	private parseAttributes(): void {
		// HACK: goto
		class End {}
		try {
			let pos = this.ps.charPos;
			if (this.ps.chars === undefined) {
				throw new Error('Assertion failed.');
			}
			let chars = this.ps.chars;
			let attr: NodeData | undefined = undefined;

			if (this.attrCount !== 0) {
				throw new Error('Assertion failed.');
			}

			while (true) {
				// eat whitespace
				let lineNoDelta = 0;
				let tmpch0: number;
				while (isWhiteSpace((tmpch0 = chars[pos]))) {
					if (tmpch0 === 0xa) {
						this.onNewLine(pos + 1);
						lineNoDelta++;
					} else if (tmpch0 === 0xd) {
						if (chars[pos + 1] === 0xa) {
							this.onNewLine(pos + 1);
							lineNoDelta++;
							pos++;
						} else if (pos + 1 !== this.ps.charsUsed) {
							this.onNewLine(pos + 1);
							lineNoDelta++;
						} else {
							this.ps.charPos = pos;
							// TODO
							throw new Error('Method not implemented.');
						}
					}
					pos++;
				}

				let tmpch1: number;
				let startNameCharSize = 0;

				if (isStartNCNameSingleChar((tmpch1 = chars[pos]))) {
					startNameCharSize = 1;
				}

				if (startNameCharSize === 0) {
					// element end
					if (tmpch1 === '>'.charCodeAt(0)) {
						if (this.curNode.type !== XmlNodeType.Element) {
							throw new Error('Assertion failed.');
						}
						this.ps.charPos = pos + 1;
						this.parsingFunction =
							ParsingFunction.MoveToElementContent;
						// HACK: goto
						throw new End();
					}
					// empty element end
					else if (tmpch1 === '/'.charCodeAt(0)) {
						if (this.curNode.type !== XmlNodeType.Element) {
							throw new Error('Assertion failed.');
						}
						if (pos + 1 === this.ps.charsUsed) {
							// TODO
							throw new Error('Method not implemented.');
						}
						if (chars[pos + 1] === '>'.charCodeAt(0)) {
							this.ps.charPos = pos + 2;
							this.curNode.isEmptyElement = true;
							this.nextParsingFunction = this.parsingFunction;
							this.parsingFunction =
								ParsingFunction.PopEmptyElementContext;
							// HACK: goto
							throw new End();
						} else {
							throw new XmlError(/* TODO: message */);
						}
					} else if (pos === this.ps.charsUsed) {
						// TODO
						throw new Error('Method not implemented.');
					} else if (
						tmpch1 !== ':'.charCodeAt(0) ||
						this.supportNamespaces
					) {
						throw new XmlError(/* TODO: message */);
					}
				}

				if (pos === this.ps.charPos) {
					// TODO
					throw new Error('Method not implemented.');
				}
				this.ps.charPos = pos;

				// save attribute name line position
				const attrNameLinePos = this.ps.linePos;

				const attrNameLineNo = this.ps.lineNo;

				// parse attribute name
				let colonPos = -1;

				pos += startNameCharSize;

				// parse attribute name
				ContinueParseName: while (true) {
					let tmpch2: number;

					while (true) {
						if (isNCNameSingleChar((tmpch2 = chars[pos]))) {
							pos++;
						} else {
							break;
						}
					}

					// colon -> save prefix end position and check next char if it's name start char
					if (tmpch2 === ':'.charCodeAt(0)) {
						if (colonPos !== -1) {
							if (this.supportNamespaces) {
								throw new XmlError(/* TODO: message */);
							} else {
								pos++;
								continue ContinueParseName;
							}
						} else {
							colonPos = pos;
							pos++;

							if (isStartNCNameSingleChar(chars[pos])) {
								pos++;
								continue ContinueParseName;
							}
							// else fallback to full name parsing routine
							pos = this.parseQName(true, 0, {
								set: (value) => (colonPos = value),
							});
							chars = this.ps.chars;
						}
					} else if (pos + 1 >= this.ps.charsUsed) {
						pos = this.parseQName(true, 0, {
							set: (value) => (colonPos = value),
						});
						chars = this.ps.chars;
					}
					break;
				}

				attr = this.addAttribute(pos, colonPos);
				attr.setLineInfo(this.ps.lineNo, attrNameLinePos);

				if (attrNameLineNo !== this.ps.lineNo) {
					throw new Error('Assertion failed.');
				}

				// parse equals and quote char;
				if (chars[pos] !== '='.charCodeAt(0)) {
					this.ps.charPos = pos;
					this.eatWhitespaces(undefined);
					pos = this.ps.charPos;
					if (chars[pos] !== '='.charCodeAt(0)) {
						throw new XmlError(/* TODO: message */);
					}
				}
				pos++;

				let quoteChar = chars[pos];
				if (
					quoteChar !== '"'.charCodeAt(0) &&
					quoteChar !== "'".charCodeAt(0)
				) {
					this.ps.charPos = pos;
					this.eatWhitespaces(undefined);
					pos = this.ps.charPos;
					quoteChar = chars[pos];
					if (
						quoteChar !== '"'.charCodeAt(0) &&
						quoteChar !== "'".charCodeAt(0)
					) {
						throw new XmlError(/* TODO: message */);
					}
				}
				pos++;
				this.ps.charPos = pos;

				attr.quoteChar = quoteChar;
				attr.setLineInfo2(this.ps.lineNo, this.ps.linePos);

				// parse attribute value
				let tmpch3: number;
				while (isAttributeValueChar((tmpch3 = chars[pos]))) {
					pos++;
				}

				if (tmpch3 === quoteChar) {
					// TODO
					attr.setChars(
						chars,
						this.ps.charPos,
						pos - this.ps.charPos,
					);
					pos++;
					this.ps.charPos = pos;
				} else {
					this.parseAttributeValueSlow(pos, quoteChar, attr);
					pos = this.ps.charPos;
					chars = this.ps.chars;
				}

				// handle special attributes:
				if (attr.prefix.length === 0) {
					// default namespace declaration
					if (attr.localName === this.xmlNs /* REVIEW: Ref.equal */) {
						this.onDefaultNamespaceDecl(attr);
					}
				} else {
					// prefixed namespace declaration
					if (attr.prefix === this.xmlNs /* REVIEW: Ref.equal */) {
						this.onNamespaceDecl(attr);
					}
					// xml: attribute
					else if (attr.prefix === this.xml /* REVIEW: Ref.equal */) {
						this.onXmlReservedAttribute(attr);
					}
				}
				continue;

				// TODO: ReadData:
			}
		} catch (error) {
			// HACK: goto
			if (error instanceof End) {
				if (this._addDefaultAttributesAndNormalize) {
					this.addDefaultAttributesAndNormalize();
				}
				// lookup namespaces: element
				this.elementNamespaceLookup();

				// lookup namespaces: attributes
				if (this.attrNeedNamespaceLookup) {
					this.attributeNamespaceLookup();
					this.attrNeedNamespaceLookup = false;
				}

				// check duplicate attributes
				if (this.attrDuplWalkCount >= maxAttrDuplWalkCount) {
					this.attributeDuplCheck();
				}
			} else {
				throw error;
			}
		}
	}

	// Parses the element start tag
	private parseElement(): void {
		let pos = this.ps.charPos;
		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}
		let chars = this.ps.chars;
		let colonPos = -1;

		this.curNode.setLineInfo(this.ps.lineNo, this.ps.linePos);

		// TODO

		// TODO: ParseQNameSlow:
		pos = this.parseQName(true, 0, {
			set: (value) => (colonPos = value),
		});
		chars = this.ps.chars;

		// TODO: SetElement:
		// push namespace context
		if (this.namespaceManager === undefined) {
			throw new Error('Assertion failed.');
		}
		this.namespaceManager.pushScope();

		// init the NodeData class
		if (colonPos === -1 || !this.supportNamespaces) {
			const localName = this.nameTable.addChars(
				chars,
				this.ps.charPos,
				pos - this.ps.charPos,
			);
			this.curNode.setNamedNode(
				XmlNodeType.Element,
				localName,
				'',
				localName,
			);
		} else {
			const startPos = this.ps.charPos;
			const prefixLen = colonPos - startPos;
			if (
				prefixLen === this.lastPrefix.length &&
				String.fromCharCode(...chars.slice(startPos)).startsWith(
					this.lastPrefix,
				)
			) {
				this.curNode.setNamedNode(
					XmlNodeType.Element,
					this.nameTable.addChars(
						chars,
						colonPos + 1,
						pos - colonPos - 1,
					),
					this.lastPrefix,
					undefined,
				);
			} else {
				this.curNode.setNamedNode(
					XmlNodeType.Element,
					this.nameTable.addChars(
						chars,
						colonPos + 1,
						pos - colonPos - 1,
					),
					this.nameTable.addChars(chars, this.ps.charPos, prefixLen),
					undefined,
				);
				this.lastPrefix = this.curNode.prefix;
			}
		}

		const ch = chars[pos];
		// whitespace after element name -> there are probably some attributes
		const isWs = isWhiteSpace(ch);
		if (isWs) {
			this.ps.charPos = pos;
			this.parseAttributes();
			return;
		}
		// no attributes
		else {
			// non-empty element
			if (ch === '>'.charCodeAt(0)) {
				this.ps.charPos = pos + 1;
				this.parsingFunction = ParsingFunction.MoveToElementContent;
			}
			// empty element
			else if (ch === '/'.charCodeAt(0)) {
				// TODO
				throw new Error('Method not implemented.');
			}
			// something else after the element name
			else {
				throw new XmlError(/* TOOD: message */);
			}

			// add default attributes & strip spaces in attributes with type other than CDATA
			if (this._addDefaultAttributesAndNormalize) {
				this.addDefaultAttributesAndNormalize();
			}

			// lookup element namespace
			this.elementNamespaceLookup();
		}
	}

	// Returns the whitespace node type according to the current whitespaceHandling setting and xml:space
	private getWhitespaceType(): XmlNodeType {
		if (this.whitespaceHandling !== WhitespaceHandling.None) {
			if (this.xmlContext.xmlSpace === XmlSpace.Preserve) {
				return XmlNodeType.SignificantWhitespace;
			}

			if (this.whitespaceHandling === WhitespaceHandling.All) {
				return XmlNodeType.Whitespace;
			}
		}

		return XmlNodeType.None;
	}

	private getTextNodeType(orChars: number): XmlNodeType {
		if (orChars > 0x20) {
			return XmlNodeType.Text;
		} else {
			return this.getWhitespaceType();
		}
	}

	private zeroEndingStream(pos: number): boolean {
		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}

		// TODO: implement

		return false;
	}

	private parseRootLevelWhitespace(): boolean {
		if (this.stringBuilder.length !== 0) {
			throw new Error('Assertion failed.');
		}

		const nodeType = this.getWhitespaceType();

		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}
		if (nodeType === XmlNodeType.None) {
			this.eatWhitespaces(undefined);
			if (
				this.ps.chars[this.ps.charPos] === '<'.charCodeAt(0) ||
				this.ps.charsUsed - this.ps.charPos === 0 ||
				this.zeroEndingStream(this.ps.charPos)
			) {
				return false;
			}
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}

		if (isCharData(this.ps.chars[this.ps.charPos])) {
			throw new XmlError('Data at the root level is invalid.' /* LOC */);
		} else {
			throw new XmlError(/* TODO: message */);
		}
		return false;
	}

	private shiftBuffer(
		sourcePos: number,
		destPos: number,
		count: number,
	): void {
		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}
		XmlTextReaderImpl.blockCopyChars(
			this.ps.chars,
			sourcePos,
			this.ps.chars,
			destPos,
			count,
		);
	}

	private parseTextCore(
		startPos: Out<number>,
		endPos: Out<number>,
		outOrChars: Ref<number>,
	): boolean {
		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}
		const chars = this.ps.chars;
		let pos = this.ps.charPos;
		let rcount = 0;
		let rpos = -1;
		let orChars = outOrChars.get();
		let c = 0;

		// HACK: goto
		class ReturnPartialValue {}
		try {
			while (true) {
				// parse text content
				while (isTextChar((c = chars[pos]))) {
					orChars |= c;
					pos++;
				}

				switch (c) {
					case 0x9:
						pos++;
						continue;
					// eol
					case 0xa:
						pos++;
						this.onNewLine(pos);
						continue;
					case 0xd:
						if (chars[pos + 1] === 0xa) {
							if (
								!this.ps.eolNormalized &&
								this.parsingMode === ParsingMode.Full
							) {
								if (pos - this.ps.charPos > 0) {
									if (rcount === 0) {
										rcount = 1;
										rpos = pos;
									} else {
										this.shiftBuffer(
											rpos + rcount,
											rpos,
											pos - rpos - rcount,
										);
										rpos = pos - rcount;
										rcount++;
									}
								} else {
									this.ps.charPos++;
								}
							}
							pos += 2;
						} else if (
							pos + 1 < this.ps.charsUsed ||
							this.ps.isEof
						) {
							if (!this.ps.eolNormalized) {
								chars[pos] = 0xa; // EOL normalization of 0xD
							}
							pos++;
						} else {
							// TODO
							throw new Error('Method not implemented.');
						}
						this.onNewLine(pos);
						continue;
					// some tag
					case '<'.charCodeAt(0):
						// HACK: goto
						throw new ReturnPartialValue();
					// entity reference
					case '&'.charCodeAt(0):
						// TODO
						throw new Error('Method not implemented.');
					case ']'.charCodeAt(0):
						// TODO
						throw new Error('Method not implemented.');
					default:
						// TODO
						throw new Error('Method not implemented.');
				}

				// TODO
				throw new Error('Method not implemented.');
			}

			// TODO
			throw new Error('Method not implemented.');
		} catch (error) {
			// HACK: goto
			if (error instanceof ReturnPartialValue) {
				if (this.parsingMode === ParsingMode.Full && rcount > 0) {
					this.shiftBuffer(rpos + rcount, rpos, pos - rpos - rcount);
				}
				startPos.set(this.ps.charPos);
				endPos.set(pos - rcount);
				this.ps.charPos = pos;
				outOrChars.set(orChars);
				return c === '<'.charCodeAt(0);
			} else {
				throw error;
			}
		}
	}

	private setupEndEntityNodeInContent(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	private parseEntityReference(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	// Parses text or whitespace node.
	// Returns true if a node has been parsed and its data set to curNode.
	// Returns false when a whitespace has been parsed and ignored (according to current whitespace handling) or when parsing mode is not Full.
	// Also returns false if there is no text to be parsed.
	private parseText(): boolean {
		// HACK: goto
		class IgnoredNode {}
		try {
			let startPos = 0;
			let endPos = 0;
			let orChars = 0;

			// skip over the text if not in full parsing mode
			if (this.parsingMode !== ParsingMode.Full) {
				while (
					!this.parseTextCore(
						{ set: () => {} },
						{ set: () => {} },
						{
							get: () => orChars,
							set: (value) => (orChars = value),
						},
					)
				);
				// HACK: goto
				throw new IgnoredNode();
			}

			this.curNode.setLineInfo(this.ps.lineNo, this.ps.linePos);
			if (this.stringBuilder.length !== 0) {
				throw new Error('Assertion failed.');
			}

			// the whole value is in buffer
			if (
				this.parseTextCore(
					{ set: (value) => (startPos = value) },
					{ set: (value) => (endPos = value) },
					{ get: () => orChars, set: (value) => (orChars = value) },
				)
			) {
				if (endPos - startPos === 0) {
					// HACK: goto
					throw new IgnoredNode();
				}

				const nodeType = this.getTextNodeType(orChars);
				if (nodeType === XmlNodeType.None) {
					// HACK: goto
					throw new IgnoredNode();
				}

				if (endPos - startPos <= 0) {
					throw new Error('Assertion failed.');
				}
				if (this.ps.chars === undefined) {
					throw new Error('Assertion failed.');
				}
				this.curNode.setValueNode(
					nodeType,
					this.ps.chars,
					startPos,
					endPos - startPos,
				);
				return true;
			}
			// only piece of the value was returned
			else {
				// TODO
				throw new Error('Method not implemented.');
			}
		} catch (error) {
			// HACK: goto
			if (error instanceof IgnoredNode) {
				// ignored whitespace at the end of manually resolved entity
				if (this.parsingFunction === ParsingFunction.ReportEndEntity) {
					this.setupEndEntityNodeInContent();
					this.parsingFunction = this.nextParsingFunction;
					return true;
				} else if (
					this.parsingFunction === ParsingFunction.EntityReference
				) {
					this.parsingFunction = this.nextParsingFunction;
					this.parseEntityReference();
					return true;
				}
				return false;
			} else {
				throw error;
			}
		}
	}

	private onEof(): void {
		if (!this.ps.isEof) {
			throw new Error('Assertion failed.');
		}
		this.curNode = this.nodes[0];
		this.curNode.clear(XmlNodeType.None);
		this.curNode.setLineInfo(this.ps.lineNo, this.ps.linePos);

		this.parsingFunction = ParsingFunction.Eof;
		this._readState = ReadState.EndOfFile;

		// TODO: this.reportedEncoding = undefined;
	}

	// Parses the document content
	private parseDocumentContent(): boolean {
		const mangoQuirks = false;
		while (true) {
			let needMoreChars = false;
			let pos = this.ps.charPos;
			if (this.ps.chars === undefined) {
				throw new Error('Assertion failed.');
			}
			const chars = this.ps.chars;

			// HACK: goto
			class ReadData {}
			try {
				// some tag
				if (chars[pos] === '<'.charCodeAt(0)) {
					needMoreChars = true;
					if (this.ps.charsUsed - pos < 4) {
						// minimum  "<a/>"
						// HACK: goto
						throw new ReadData();
					}
					pos++;
					switch (chars[pos]) {
						// processing instruction
						case '?'.charCodeAt(0):
							this.ps.charPos = pos + 1;
							if (this.parsePI()) {
								return true;
							}
							continue;
						case '!'.charCodeAt(0):
							// TODO
							throw new Error('Method not implemented.');
						case '/'.charCodeAt(0):
							// TODO
							throw new Error('Method not implemented.');
						// document element start tag
						default:
							if (this.rootElementParsed) {
								if (
									this.fragmentType === XmlNodeType.Document
								) {
									throw new XmlError(
										'There are multiple root elements.' /* LOC */,
									);
								}
								if (this.fragmentType === XmlNodeType.None) {
									this.fragmentType = XmlNodeType.Element;
								}
							}
							this.ps.charPos = pos;
							this.rootElementParsed = true;
							this.parseElement();
							return true;
					}
				} else if (chars[pos] === '&'.charCodeAt(0)) {
					// TODO
					throw new Error('Method not implemented.');
				}
				// end of buffer
				else if (
					pos === this.ps.charsUsed ||
					((this.v1Compat || mangoQuirks) && chars[pos] === 0x0)
				) {
					throw new ReadData();
				}
				// something else -> root level whitespace
				else {
					if (this.fragmentType === XmlNodeType.Document) {
						if (this.parseRootLevelWhitespace()) {
							return true;
						}
					} else {
						if (this.parseText()) {
							if (
								this.fragmentType === XmlNodeType.None &&
								this.curNode.type === XmlNodeType.Text
							) {
								this.fragmentType = XmlNodeType.Element;
							}
							return true;
						}
					}
					continue;
				}

				if (pos !== this.ps.charsUsed || this.ps.isEof) {
					throw new Error('Assertion failed.');
				}
			} catch (error) {
				// HACK: goto
				if (error instanceof ReadData) {
					// read new characters into the buffer
					if (this.readData() === 0) {
						if (needMoreChars) {
							throw new XmlError(
								'Data at the root level is invalid.' /* LOC */,
							);
						}

						if (this.inEntity) {
							// TODO
							throw new Error('Method not implemented.');
						}
						if (this.index !== 0) {
							throw new Error('Assertion failed.');
						}

						if (
							!this.rootElementParsed &&
							this.fragmentType === XmlNodeType.Document
						) {
							throw new XmlError(
								'Root element is missing.' /* LOC */,
							);
						}

						if (this.fragmentType === XmlNodeType.None) {
							this.fragmentType = this.rootElementParsed
								? XmlNodeType.Document
								: XmlNodeType.Element;
						}
						this.onEof();
						return false;
					}
				} else {
					throw error;
				}
			}
		}
	}

	// parses the element end tag
	private parseEndElement(): void {
		// check if the end tag name equals start tag name
		const startTagNode = this.nodes[this.index - 1];

		const prefLen = startTagNode.prefix.length;
		const locLen = startTagNode.localName.length;

		while (this.ps.charsUsed - this.ps.charPos < prefLen + locLen + 1) {
			if (this.readData() === 0) {
				break;
			}
		}

		let nameLen: number;
		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}
		let chars = this.ps.chars;
		if (startTagNode.prefix.length === 0) {
			if (
				!String.fromCharCode(
					...chars.slice(this.ps.charPos),
				).startsWith(startTagNode.localName)
			) {
				throw new XmlError(/* TODO: message */);
			}
			nameLen = locLen;
		} else {
			const colonPos = this.ps.charPos + prefLen;
			if (
				!String.fromCharCode(
					...chars.slice(this.ps.charPos),
				).startsWith(startTagNode.prefix) ||
				chars[colonPos] !== ':'.charCodeAt(0) ||
				!String.fromCharCode(...chars.slice(colonPos + 1)).startsWith(
					startTagNode.localName,
				)
			) {
				throw new XmlError(/* TODO: message */);
			}
			nameLen = locLen + prefLen + 1;
		}

		const endTagLineInfo = new LineInfo(this.ps.lineNo, this.ps.linePos);

		let pos: number;
		while (true) {
			pos = this.ps.charPos + nameLen;
			chars = this.ps.chars;

			if (pos === this.ps.charsUsed) {
				// TODO
				throw new Error('Method not implemented.');
			}

			if (
				isNCNameSingleChar(chars[pos]) ||
				chars[pos] === ':'.charCodeAt(0)
			) {
				throw new XmlError(/* TODO: message */);
			}

			// eat whitespace
			if (chars[pos] !== '>'.charCodeAt(0)) {
				// TODO
				throw new Error('Method not implemented.');
			}

			if (chars[pos] == '>'.charCodeAt(0)) {
				break;
			} else if (pos === this.ps.charsUsed) {
				// TODO
				throw new Error('Method not implemented.');
			} else {
				throw new XmlError(/* TODO: message */);
			}

			throw new Error('We should never get to this point.');
		}

		if (this.index <= 0) {
			throw new Error('Assertion failed.');
		}
		this.index--;
		this.curNode = this.nodes[this.index];

		// set the element data
		if (this.curNode !== startTagNode) {
			throw new Error('Assertion failed.');
		}
		startTagNode.lineInfo = endTagLineInfo;
		startTagNode.type = XmlNodeType.EndElement;
		this.ps.charPos = pos + 1;

		// set next parsing function
		this.nextParsingFunction =
			this.index > 0
				? this.parsingFunction
				: ParsingFunction.DocumentContent;
		this.parsingFunction = ParsingFunction.PopElementContext;
	}

	// Parses a chunk of CDATA section or comment. Returns true when the end of CDATA or comment was reached.
	private parseCDataOrCommentCore(
		type: XmlNodeType,
		outStartPos: Out<number>,
		outEndPos: Out<number>,
	): boolean {
		if (this.ps.charsUsed - this.ps.charPos < 3) {
			// read new characters into the buffer
			if (this.readData() === 0) {
				throw new XmlError(/* TODO: message */);
			}
		}

		if (this.ps.chars === undefined) {
			throw new Error('Assertion failed.');
		}
		let pos = this.ps.charPos;
		const chars = this.ps.chars;
		const rcount = 0;
		const rpos = -1;
		const stopChar = (type == XmlNodeType.Comment ? '-' : ']').charCodeAt(
			0,
		);

		while (true) {
			let tmpch: number;
			while (isTextChar((tmpch = chars[pos])) && tmpch !== stopChar) {
				pos++;
			}

			// possibly end of comment or cdata section
			if (chars[pos] === stopChar) {
				if (chars[pos + 1] === stopChar) {
					if (chars[pos + 2] === '>'.charCodeAt(0)) {
						if (rcount > 0) {
							if (this.ps.eolNormalized) {
								throw new Error('Assertion failed.');
							}
							this.shiftBuffer(
								rpos + rcount,
								rpos,
								pos - rpos - rcount,
							);
							outEndPos.set(pos - rcount);
						} else {
							outEndPos.set(pos);
						}
						outStartPos.set(this.ps.charPos);
						this.ps.charPos = pos + 3;
						return true;
					} else if (pos + 2 === this.ps.charsUsed) {
						// TODO
						throw new Error('Method not implemented.');
					} else if (type === XmlNodeType.Comment) {
						throw new XmlError(/* TODO: message */);
					}
				} else if (pos + 1 === this.ps.charsUsed) {
					// TODO
					throw new Error('Method not implemented.');
				}
				pos++;
				continue;
			} else {
				// TODO
				throw new Error('Method not implemented.');
			}
		}
	}

	// Parses CDATA section or comment
	private parseCDataOrComment(type: XmlNodeType): void {
		let startPos = 0,
			endPos = 0;

		if (this.parsingMode === ParsingMode.Full) {
			this.curNode.setLineInfo(this.ps.lineNo, this.ps.linePos);
			if (this.stringBuilder.length !== 0) {
				throw new Error('Assertion failed.');
			}
			if (
				this.parseCDataOrCommentCore(
					type,
					{ set: (value) => (startPos = value) },
					{ set: (value) => (endPos = value) },
				)
			) {
				if (this.ps.chars === undefined) {
					throw new Error('Assertion failed.');
				}
				this.curNode.setValueNode(
					type,
					this.ps.chars,
					startPos,
					endPos - startPos,
				);
			} else {
				// TODO
				throw new Error('Method not implemented.');
			}
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	private parseComment(): boolean {
		if (this.ignoreComments) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			this.parseCDataOrComment(XmlNodeType.Comment);
			return true;
		}
	}

	// Parses element content
	private parseElementContent(): boolean {
		while (true) {
			let pos = this.ps.charPos;
			if (this.ps.chars === undefined) {
				throw new Error('Method not implemented.');
			}
			const chars = this.ps.chars;

			switch (chars[pos]) {
				// some tag
				case '<'.charCodeAt(0):
					switch (chars[pos + 1]) {
						// processing instruction
						case '?'.charCodeAt(0):
							this.ps.charPos = pos + 2;
							if (this.parsePI()) {
								return true;
							}
							continue;
						case '!'.charCodeAt(0):
							pos += 2;
							if (this.ps.charsUsed - pos < 2) {
								// TODO
								throw new Error('Method not implemented.');
							}
							// comment
							if (chars[pos] === '-'.charCodeAt(0)) {
								if (chars[pos + 1] === '-'.charCodeAt(0)) {
									this.ps.charPos = pos + 2;
									if (this.parseComment()) {
										return true;
									}
									continue;
								} else {
									throw new XmlError(/* TODO: message */);
								}
							}
							// CDATA section
							else if (chars[pos] === '['.charCodeAt(0)) {
								// TODO
								throw new Error('Method not implemented.');
							} else {
								// TODO
								throw new Error('Method not implemented.');
							}
							break;
						// element end tag
						case '/'.charCodeAt(0):
							this.ps.charPos = pos + 2;
							this.parseEndElement();
							return true;
						default:
							// end of buffer
							if (pos + 1 === this.ps.charsUsed) {
								// TODO
								throw new Error('Method not implemented.');
							} else {
								// element start tag
								this.ps.charPos = pos + 1;
								this.parseElement();
								return true;
							}
					}
					break;
				case '&'.charCodeAt(0):
					if (this.parseText()) {
						return true;
					}
					continue;
				default:
					// end of buffer
					if (pos === this.ps.charsUsed) {
						// TODO
						throw new Error('Method not implemented.');
					} else {
						// text node, whitespace or entity reference
						if (this.parseText()) {
							return true;
						}
						continue;
					}
			}

			// TODO: ReadData:
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	private popXmlContext(): void {
		if (!this.curNode.xmlContextPushed) {
			throw new Error('Assertion failed.');
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.xmlContext = this.xmlContext.previousContext!;
		this.curNode.xmlContextPushed = false;
	}

	private popElementContext(): void {
		if (this.namespaceManager === undefined) {
			throw new Error('Assertion failed.');
		}
		// pop namespace context
		this.namespaceManager.popScope();

		// pop xml context
		if (this.curNode.xmlContextPushed) {
			this.popXmlContext();
		}
	}

	// Reads next node from the input data
	read(): boolean {
		/* TODO: if (this.laterInitParam !== undefined) {
			this.finishInit();
		} */

		while (true) {
			switch (this.parsingFunction) {
				case ParsingFunction.ElementContent:
					return this.parseElementContent();
				case ParsingFunction.DocumentContent:
					return this.parseDocumentContent();
				case ParsingFunction.OpenUrl:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.SwitchToInteractive:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.SwitchToInteractiveXmlDecl:
					this._readState = ReadState.Interactive;
					this.parsingFunction = this.nextParsingFunction;
					if (this.parseXmlDeclaration(false)) {
						// TODO: this.reportedEncoding = this.ps.encoding;
						return true;
					}
					// TODO: this.reportedEncoding = this.ps.encoding;
					continue;
				case ParsingFunction.ResetAttributesRootLevel:
					this.resetAttributes();
					this.curNode = this.nodes[this.index];
					this.parsingFunction =
						this.index === 0
							? ParsingFunction.DocumentContent
							: ParsingFunction.ElementContent;
					continue;
				case ParsingFunction.MoveToElementContent:
					this.resetAttributes();
					this.index++;
					this.curNode = this.addNode(this.index, this.index);
					this.parsingFunction = ParsingFunction.ElementContent;
					continue;
				case ParsingFunction.PopElementContext:
					this.popElementContext();
					this.parsingFunction = this.nextParsingFunction;
					if (
						this.parsingFunction !==
							ParsingFunction.ElementContent &&
						this.parsingFunction !== ParsingFunction.DocumentContent
					) {
						throw new Error('Assertion failed.');
					}
					continue;
				case ParsingFunction.PopEmptyElementContext:
					this.curNode = this.nodes[this.index];
					if (this.curNode.type !== XmlNodeType.Element) {
						throw new Error('Assertion failed.');
					}
					this.curNode.isEmptyElement = false;
					this.resetAttributes();
					this.popElementContext();
					this.parsingFunction = this.nextParsingFunction;
					continue;
				case ParsingFunction.EntityReference:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.ReportEndEntity:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.AfterResolveEntityInContent:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.AfterResolveEmptyEntityInContent:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.InReadAttributeValue:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.InIncrementalRead:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.FragmentAttribute:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.XmlDeclarationFragment:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.GoToEof:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.Error:
				case ParsingFunction.Eof:
				case ParsingFunction.ReaderClosed:
					return false;
				case ParsingFunction.NoData:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.PartialTextValue:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.InReadValueChunk:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.InReadContentAsBinary:
					// TODO
					throw new Error('Method not implemented.');
				case ParsingFunction.InReadElementContentAsBinary:
					// TODO
					throw new Error('Method not implemented.');
				default:
					throw new Error(
						`Unexpected parsing function ${this.parsingFunction}`,
					);
			}
		}
	}
}
