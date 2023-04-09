import { StringBuilder } from './StringBuilder';
import { isNCNameSingleChar, isStartNCNameSingleChar } from './XmlCharType';
import { XmlError } from './XmlError';
import { XmlRawWriter } from './XmlRawWriter';
import { XmlReservedNs } from './XmlReservedNs';
import { XmlSpace } from './XmlSpace';
import { WriteState, XmlWriter } from './XmlWriter';
import {
	ConformanceLevel,
	NamespaceHandling,
	XmlStandalone,
	XmlWriterSettings,
} from './XmlWriterSettings';

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,734e9d291573ffed,references
class ElementScope {
	/** @internal */ prevNSTop = 0;
	/** @internal */ prefix: string = undefined!;
	/** @internal */ localName: string = undefined!;
	/** @internal */ namespaceUri: string = undefined!;
	/** @internal */ xmlSpace = XmlSpace.None;
	/** @internal */ xmlLang?: string;

	/** @internal */ set(
		prefix: string,
		localName: string,
		namespaceUri: string,
		prevNSTop: number,
	): void {
		this.prevNSTop = prevNSTop;
		this.prefix = prefix;
		this.namespaceUri = namespaceUri;
		this.localName = localName;
		this.xmlSpace = -1 as XmlSpace;
		this.xmlLang = undefined;
	}

	/** @internal */ writeEndElement(rawWriter: XmlRawWriter): void {
		rawWriter.writeEndElementWithFullName(
			this.prefix,
			this.localName,
			this.namespaceUri,
		);
	}

	/** @internal */ writeFullEndElement(rawWriter: XmlRawWriter): void {
		rawWriter.writeFullEndElementWithFullName(
			this.prefix,
			this.localName,
			this.namespaceUri,
		);
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,90c05124b644f384,references
enum NamespaceKind {
	Written,
	NeedToWrite,
	Implied,
	Special,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,8a7758aadb346d66
class Namespace {
	/** @internal */ prefix: string = undefined!;
	/** @internal */ namespaceUri: string = undefined!;
	/** @internal */ kind = NamespaceKind.Written;
	/** @internal */ prevNsIndex = 0;

	/** @internal */ set(
		prefix: string,
		namespaceUri: string,
		kind: NamespaceKind,
	): void {
		this.prefix = prefix;
		this.namespaceUri = namespaceUri;
		this.kind = kind;
		this.prevNsIndex = -1;
	}

	/** @internal */ writeDecl(
		writer: XmlWriter,
		rawWriter: XmlRawWriter | undefined,
	): void {
		if (this.kind !== NamespaceKind.NeedToWrite) {
			throw new Error('Assertion failed.');
		}
		if (rawWriter !== undefined) {
			rawWriter.writeNamespaceDeclaration(this.prefix, this.namespaceUri);
		} else {
			if (this.prefix.length === 0) {
				writer.writeStartAttribute('', 'xmlns', XmlReservedNs.NsXmlNs);
			} else {
				writer.writeStartAttribute(
					'xmlns',
					this.prefix,
					XmlReservedNs.NsXmlNs,
				);
			}

			writer.writeString(this.namespaceUri);
			writer.writeEndAttribute();
		}
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,98459c89f9f50423,references
class AttrName {
	/** @internal */ prefix: string = undefined!;
	/** @internal */ namespaceUri: string = undefined!;
	/** @internal */ localName: string = undefined!;
	/** @internal */ prev = 0;

	/** @internal */ set(
		prefix: string,
		localName: string,
		namespaceUri: string,
	): void {
		this.prefix = prefix;
		this.namespaceUri = namespaceUri;
		this.localName = localName;
		this.prev = 0;
	}

	/** @internal */ isDuplicate(
		prefix: string,
		localName: string,
		namespaceUri: string,
	): boolean {
		return (
			this.localName === localName &&
			(this.prefix === prefix || this.namespaceUri === namespaceUri)
		);
	}
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,d9d8a72ee9f0daf6,references
enum SpecialAttribute {
	No = 0,
	DefaultXmlns,
	PrefixedXmlns,
	XmlSpace,
	XmlLang,
}

enum ItemType {
	EntityRef,
	CharEntity,
	SurrogateCharEntity,
	Whitespace,
	String,
	StringChars,
	Raw,
	RawChars,
	ValueString,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriterHelpers.cs,d1d08de4980914bf,references
class AttributeValueCache {
	private _stringValue = new StringBuilder();
	private singleStringValue?: string; // special-case for a single WriteString call
	private firstItem = 0;
	private lastItem = -1;

	/** @internal */ get stringValue(): string {
		if (this.singleStringValue !== undefined) {
			return this.singleStringValue;
		} else {
			return this.stringValue.toString();
		}
	}

	private addItem(type: ItemType, data: string /* TODO: object */): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	/** @internal */ writeString(text: string): void {
		if (this.singleStringValue !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			// special-case for a single WriteString
			if (this.lastItem === -1) {
				this.singleStringValue = text;
				return;
			}
		}

		this._stringValue.appendString(text);
		this.addItem(ItemType.String, text);
	}

	/** @internal */ clear(): void {
		this.singleStringValue = undefined;
		this.lastItem = -1;
		this.firstItem = 0;
		this._stringValue.length = 0;
	}
}

//
// Constants
//
const elementStackInitialSize = 8;
const namespaceStackInitialSize = 8;
const attributeArrayInitialSize = 8;
const maxAttrDuplWalkCount = 14;
const maxNamespacesWalkCount = 16;

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriter.cs,b4a25faed8280ec6,references
//
// State tables
//
enum State {
	Start = 0,
	TopLevel = 1,
	Document = 2,
	Element = 3,
	Content = 4,
	B64Content = 5,
	B64Attribute = 6,
	AfterRootEle = 7,
	Attribute = 8,
	SpecialAttr = 9,
	EndDocument = 10,
	RootLevelAttr = 11,
	RootLevelSpecAttr = 12,
	RootLevelB64Attr = 13,
	AfterRootLevelAttr = 14,
	Closed = 15,
	Error = 16,

	StartContent = 101,
	StartContentEle = 102,
	StartContentB64 = 103,
	StartDoc = 104,
	StartDocEle = 106,
	EndAttrSEle = 107,
	EndAttrEEle = 108,
	EndAttrSCont = 109,
	EndAttrSAttr = 111,
	PostB64Cont = 112,
	PostB64Attr = 113,
	PostB64RootAttr = 114,
	StartFragEle = 115,
	StartFragCont = 116,
	StartFragB64 = 117,
	StartRootLevelAttr = 118,
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriter.cs,f1620b9f280353b5,references
enum Token {
	StartDocument,
	EndDocument,
	PI,
	Comment,
	Dtd,
	StartElement,
	EndElement,
	StartAttribute,
	EndAttribute,
	Text,
	CData,
	AtomicValue,
	Base64,
	RawData,
	Whitespace,
}

const stateName = {
	[State.Start]: 'Start', // State.Start
	[State.TopLevel]: 'TopLevel', // State.TopLevel
	[State.Document]: 'Document', // State.Document
	[State.Element]: 'Element Start Tag', // State.Element
	[State.Content]: 'Element Content', // State.Content
	[State.B64Content]: 'Element Content', // State.B64Content
	[State.B64Attribute]: 'Attribute', // State.B64Attribute
	[State.AfterRootEle]: 'EndRootElement', // State.AfterRootEle
	[State.Attribute]: 'Attribute', // State.Attribute
	[State.SpecialAttr]: 'Special Attribute', // State.SpecialAttr
	[State.EndDocument]: 'End Document', // State.EndDocument
	[State.RootLevelAttr]: 'Root Level Attribute Value', // State.RootLevelAttr
	[State.RootLevelSpecAttr]: 'Root Level Special Attribute Value', // State.RootLevelSpecAttr
	[State.RootLevelB64Attr]: 'Root Level Base64 Attribute Value', // State.RootLevelB64Attr
	[State.AfterRootLevelAttr]: 'After Root Level Attribute', // State.AfterRootLevelAttr
	[State.Closed]: 'Closed', // State.Closed
	[State.Error]: 'Error', // State.Error
} as const;

const tokenName = {
	[Token.StartDocument]: 'StartDocument', // Token.StartDocument
	[Token.EndDocument]: 'EndDocument', // Token.EndDocument
	[Token.PI]: 'PI', // Token.PI
	[Token.Comment]: 'Comment', // Token.Comment
	[Token.Dtd]: 'DTD', // Token.Dtd
	[Token.StartElement]: 'StartElement', // Token.StartElement
	[Token.EndElement]: 'EndElement', // Token.EndElement
	[Token.StartAttribute]: 'StartAttribute', // Token.StartAttribut
	[Token.EndAttribute]: 'EndAttribute', // Token.EndAttribute
	[Token.Text]: 'Text', // Token.Text
	[Token.CData]: 'CDATA', // Token.CData
	[Token.AtomicValue]: 'Atomic value', // Token.AtomicValue
	[Token.Base64]: 'Base64', // Token.Base64
	[Token.RawData]: 'RawData', // Token.RawData
	[Token.Whitespace]: 'Whitespace', // Token.Whitespace
} as const;

const state2WriteState = {
	[State.Start]: WriteState.Start, // State.Start
	[State.TopLevel]: WriteState.Prolog, // State.TopLevel
	[State.Document]: WriteState.Prolog, // State.Document
	[State.Element]: WriteState.Element, // State.Element
	[State.Content]: WriteState.Content, // State.Content
	[State.B64Content]: WriteState.Content, // State.B64Content
	[State.B64Attribute]: WriteState.Attribute, // State.B64Attribute
	[State.AfterRootEle]: WriteState.Content, // State.AfterRootEle
	[State.Attribute]: WriteState.Attribute, // State.Attribute
	[State.SpecialAttr]: WriteState.Attribute, // State.SpecialAttr
	[State.EndDocument]: WriteState.Content, // State.EndDocument
	[State.RootLevelAttr]: WriteState.Attribute, // State.RootLevelAttr
	[State.RootLevelSpecAttr]: WriteState.Attribute, // State.RootLevelSpecAttr
	[State.RootLevelB64Attr]: WriteState.Attribute, // State.RootLevelB64Attr
	[State.AfterRootLevelAttr]: WriteState.Attribute, // State.AfterRootLevelAttr
	[State.Closed]: WriteState.Closed, // State.Closed
	[State.Error]: WriteState.Error, // State.Error
} as const;

const stateTableDocument = [
	//                         State.Start           State.TopLevel   State.Document     State.Element          State.Content     State.B64Content      State.B64Attribute   State.AfterRootEle    State.Attribute,      State.SpecialAttr,   State.EndDocument,  State.RootLevelAttr,      State.RootLevelSpecAttr,  State.RootLevelB64Attr   State.AfterRootLevelAttr, // 16
	/* Token.StartDocument  */ State.Document,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.EndDocument    */ State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.Error,
	State.EndDocument,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.PI             */ State.StartDoc,
	State.TopLevel,
	State.Document,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Comment        */ State.StartDoc,
	State.TopLevel,
	State.Document,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Dtd            */ State.StartDoc,
	State.TopLevel,
	State.Document,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.StartElement   */ State.StartDocEle,
	State.Element,
	State.Element,
	State.StartContentEle,
	State.Element,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrSEle,
	State.EndAttrSEle,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.EndElement     */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrEEle,
	State.EndAttrEEle,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.StartAttribute */ State.Error,
	State.Error,
	State.Error,
	State.Attribute,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrSAttr,
	State.EndAttrSAttr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.EndAttribute   */ State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Element,
	State.Element,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Text           */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.CData          */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.AtomicValue    */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Attribute,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Base64         */ State.Error,
	State.Error,
	State.Error,
	State.StartContentB64,
	State.B64Content,
	State.B64Content,
	State.B64Attribute,
	State.Error,
	State.B64Attribute,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.RawData        */ State.StartDoc,
	State.Error,
	State.Document,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	/* Token.Whitespace     */ State.StartDoc,
	State.TopLevel,
	State.Document,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
] as const;

const stateTableAuto = [
	//                         State.Start           State.TopLevel       State.Document     State.Element          State.Content     State.B64Content      State.B64Attribute   State.AfterRootEle    State.Attribute,      State.SpecialAttr,   State.EndDocument,  State.RootLevelAttr,      State.RootLevelSpecAttr,  State.RootLevelB64Attr,  State.AfterRootLevelAttr  // 16
	/* Token.StartDocument  */ State.Document,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.StartDocument  */,
	/* Token.EndDocument    */ State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.Error,
	State.EndDocument,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.EndDocument    */,
	/* Token.PI             */ State.TopLevel,
	State.TopLevel,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.PI             */,
	/* Token.Comment        */ State.TopLevel,
	State.TopLevel,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.Comment        */,
	/* Token.Dtd            */ State.StartDoc,
	State.TopLevel,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.Dtd            */,
	/* Token.StartElement   */ State.StartFragEle,
	State.Element,
	State.Error,
	State.StartContentEle,
	State.Element,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Element,
	State.EndAttrSEle,
	State.EndAttrSEle,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.StartElement   */,
	/* Token.EndElement     */ State.Error,
	State.Error,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrEEle,
	State.EndAttrEEle,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.EndElement     */,
	/* Token.StartAttribute */ State.RootLevelAttr,
	State.Error,
	State.Error,
	State.Attribute,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.EndAttrSAttr,
	State.EndAttrSAttr,
	State.Error,
	State.StartRootLevelAttr,
	State.StartRootLevelAttr,
	State.PostB64RootAttr,
	State.RootLevelAttr,
	State.Error /* Token.StartAttribute */,
	/* Token.EndAttribute   */ State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Error,
	State.Element,
	State.Element,
	State.Error,
	State.AfterRootLevelAttr,
	State.AfterRootLevelAttr,
	State.PostB64RootAttr,
	State.Error,
	State.Error /* Token.EndAttribute   */,
	/* Token.Text           */ State.StartFragCont,
	State.StartFragCont,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Content,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.RootLevelAttr,
	State.RootLevelSpecAttr,
	State.PostB64RootAttr,
	State.Error,
	State.Error /* Token.Text           */,
	/* Token.CData          */ State.StartFragCont,
	State.StartFragCont,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Content,
	State.EndAttrSCont,
	State.EndAttrSCont,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error,
	State.Error /* Token.CData          */,
	/* Token.AtomicValue    */ State.StartFragCont,
	State.StartFragCont,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Content,
	State.Attribute,
	State.Error,
	State.Error,
	State.RootLevelAttr,
	State.Error,
	State.PostB64RootAttr,
	State.Error,
	State.Error /* Token.AtomicValue    */,
	/* Token.Base64         */ State.StartFragB64,
	State.StartFragB64,
	State.Error,
	State.StartContentB64,
	State.B64Content,
	State.B64Content,
	State.B64Attribute,
	State.B64Content,
	State.B64Attribute,
	State.Error,
	State.Error,
	State.RootLevelB64Attr,
	State.Error,
	State.RootLevelB64Attr,
	State.Error,
	State.Error /* Token.Base64         */,
	/* Token.RawData        */ State.StartFragCont,
	State.TopLevel,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.Content,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.RootLevelAttr,
	State.RootLevelSpecAttr,
	State.PostB64RootAttr,
	State.AfterRootLevelAttr,
	State.Error /* Token.RawData        */,
	/* Token.Whitespace     */ State.TopLevel,
	State.TopLevel,
	State.Error,
	State.StartContent,
	State.Content,
	State.PostB64Cont,
	State.PostB64Attr,
	State.AfterRootEle,
	State.Attribute,
	State.SpecialAttr,
	State.Error,
	State.RootLevelAttr,
	State.RootLevelSpecAttr,
	State.PostB64RootAttr,
	State.AfterRootLevelAttr,
	State.Error /* Token.Whitespace     */,
] as const;

// https://source.dot.net/#System.Private.Xml/System/Xml/IXmlNamespaceResolver.cs,853789bff6dc9c81,references
interface IXmlNamespaceResolver {
	lookupNamespace(prefix: string): string | undefined;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/Core/XmlWellFormedWriter.cs,bed27629b0b34fb7,references
export class XmlWellFormedWriter extends XmlWriter {
	//
	// Fields
	//
	// underlying writer
	private readonly rawWriter: XmlRawWriter | undefined; // writer as XmlRawWriter
	private readonly predefinedNamespaces: IXmlNamespaceResolver | undefined; // writer as IXmlNamespaceResolver

	// namespace management
	private nsStack: Namespace[];
	private nsTop: number;
	private useNsHashtable = false;

	// element scoping
	private elemScopeStack: ElementScope[];
	private elemTop: number;

	// attribute tracking
	private attrStack: AttrName[];
	private attrCount = 0;

	// special attribute caching (xmlns, xml:space, xml:lang)
	private specAttr = SpecialAttribute.No;
	private attrValueCache?: AttributeValueCache;
	private curDeclPrefix?: string;

	// state machine
	private stateTable: readonly State[];
	private currentState: State;

	// settings
	private readonly omitDuplNamespaces: boolean;
	private readonly writeEndDocumentOnClose: boolean;

	// actual conformance level
	private conformanceLevel: ConformanceLevel;

	// flags
	private xmlDeclFollows = false;

	/** @internal */ constructor(
		private readonly writer:
			| XmlWriter
			| (XmlWriter & IXmlNamespaceResolver),
		settings: XmlWriterSettings,
	) {
		super();

		if (writer === undefined) {
			throw new Error('Assertion failed.');
		}
		if (settings === undefined) {
			throw new Error('Assertion failed.');
		}
		/* TODO: if (maxNamespacesWalkCount > 3) {
			throw new Error('Assertion failed.');
		} */

		if (writer instanceof XmlRawWriter) {
			this.rawWriter = writer;
		}
		if ('lookupNamespace' in writer) {
			this.predefinedNamespaces = writer;
		}

		// TODO
		this.omitDuplNamespaces =
			(settings.namespaceHandling & NamespaceHandling.OmitDuplicates) !==
			0;
		this.writeEndDocumentOnClose = settings.writeEndDocumentOnClose;

		this.conformanceLevel = settings.conformanceLevel;
		this.stateTable =
			this.conformanceLevel === ConformanceLevel.Document
				? stateTableDocument
				: stateTableAuto;

		this.currentState = State.Start;

		this.nsStack = new Array(namespaceStackInitialSize);
		for (let i = 0; i < this.nsStack.length; i++) {
			this.nsStack[i] = new Namespace();
		}
		this.nsStack[0].set(
			'xmlns',
			XmlReservedNs.NsXmlNs,
			NamespaceKind.Special,
		);
		this.nsStack[1].set('xml', XmlReservedNs.NsXml, NamespaceKind.Special);
		if (this.predefinedNamespaces === undefined) {
			this.nsStack[2].set('', '', NamespaceKind.Implied);
		} else {
			const defaultNs = this.predefinedNamespaces.lookupNamespace('');
			this.nsStack[2].set('', defaultNs ?? '', NamespaceKind.Implied);
		}
		this.nsTop = 2;

		this.elemScopeStack = new Array(elementStackInitialSize);
		for (let i = 0; i < this.elemScopeStack.length; i++) {
			this.elemScopeStack[i] = new ElementScope();
		}
		this.elemScopeStack[0].set('', '', '', this.nsTop);
		this.elemScopeStack[0].xmlSpace = XmlSpace.None;
		this.elemScopeStack[0].xmlLang = undefined;
		this.elemTop = 0;

		this.attrStack = new Array(attributeArrayInitialSize);
		for (let i = 0; i < this.attrStack.length; i++) {
			this.attrStack[i] = new AttrName();
		}
	}

	private get saveAttrValue(): boolean {
		return this.specAttr !== SpecialAttribute.No;
	}

	private get inBase64(): boolean {
		return (
			this.currentState === State.B64Content ||
			this.currentState === State.B64Attribute ||
			this.currentState === State.RootLevelB64Attr
		);
	}

	private static getStateName(state: State): string {
		if (state > State.Error) {
			throw new Error(
				`We should never get to this point. State = ${state}`,
			);
		} else {
			return stateName[state as keyof typeof stateName];
		}
	}

	private startElementContent(): void {
		// write namespace declarations
		const start = this.elemScopeStack[this.elemTop].prevNSTop;
		for (let i = this.nsTop; i > start; i--) {
			if (this.nsStack[i].kind === NamespaceKind.NeedToWrite) {
				this.nsStack[i].writeDecl(this.writer, this.rawWriter);
			}
		}

		this.rawWriter?.startElementContent();
	}

	// Advance the state machine
	private advanceState(token: Token): void {
		if (this.currentState >= State.Closed) {
			if (
				this.currentState === State.Closed ||
				this.currentState === State.Error
			) {
				throw new Error(
					'The Writer is closed or in error state.' /* LOC */,
				);
			} else {
				throw new Error(
					`Token ${
						tokenName[token]
					} in state ${XmlWellFormedWriter.getStateName(
						this.currentState,
					)} would result in an invalid XML document.` /* LOC */,
				);
			}
		}

		Advance: do {
			let newState = this.stateTable[(token << 4) + this.currentState];
			//                         [ (int)token * 16 + (int)currentState ];

			if (newState >= State.Error) {
				switch (newState) {
					case State.Error:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartContent:
						this.startElementContent();
						newState = State.Content;
						break;

					case State.StartContentEle:
						this.startElementContent();
						newState = State.Element;
						break;

					case State.StartContentB64:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartDoc:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartDocEle:
						// TODO
						throw new Error('Method not implemented.');

					case State.EndAttrSEle:
						// TODO
						throw new Error('Method not implemented.');

					case State.EndAttrEEle:
						// TODO
						throw new Error('Method not implemented.');

					case State.EndAttrSCont:
						// TODO
						throw new Error('Method not implemented.');

					case State.EndAttrSAttr:
						// TODO
						throw new Error('Method not implemented.');

					case State.PostB64Cont:
						// TODO
						throw new Error('Method not implemented.');

					case State.PostB64Attr:
						// TODO
						throw new Error('Method not implemented.');

					case State.PostB64RootAttr:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartFragEle:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartFragCont:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartFragB64:
						// TODO
						throw new Error('Method not implemented.');

					case State.StartRootLevelAttr:
						// TODO
						throw new Error('Method not implemented.');

					default:
						throw new Error('We should not get to this point.');
				}
			}

			this.currentState = newState;
			break;
		} while (true);
	}

	private writeStartDocumentImpl(standalone: XmlStandalone): void {
		try {
			this.advanceState(Token.StartDocument);

			if (this.conformanceLevel === ConformanceLevel.Auto) {
				// TODO
				throw new Error('Method not implemented.');
			} else if (this.conformanceLevel === ConformanceLevel.Fragment) {
				// TODO
				throw new Error('Method not implemented.');
			}

			if (this.rawWriter !== undefined) {
				if (!this.xmlDeclFollows) {
					this.rawWriter.writeXmlDeclaration(standalone);
				}
			} else {
				// TODO
				throw new Error('Method not implemented.');
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	writeStartDocument(): void {
		this.writeStartDocumentImpl(XmlStandalone.Omit);
	}

	writeEndDocument(): void {
		try {
			// auto-close all elements
			while (this.elemTop > 0) {
				this.writeEndElement();
			}
			const prevState = this.currentState;
			this.advanceState(Token.EndDocument);

			if (prevState !== State.AfterRootEle) {
				throw new Error(
					'Document does not have a root element.' /* LOC */,
				);
			}
			if (this.rawWriter === undefined) {
				this.writer.writeEndDocument();
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	private static checkNCName(ncname: string): void {
		if (ncname === undefined || ncname.length <= 0) {
			throw new Error('Assertion failed.');
		}

		let i: number;
		const endPos = ncname.length;

		// Check if first character is StartNCName (inc. surrogates)
		if (isStartNCNameSingleChar(ncname.charCodeAt(0))) {
			i = 1;
		} else {
			throw new Error(/* TODO: message */);
		}

		// Check if following characters are NCName (inc. surrogates)
		while (i < endPos) {
			if (isNCNameSingleChar(ncname.charCodeAt(i))) {
				i++;
			} else {
				throw new Error(/* TODO: message */);
			}
		}
	}

	lookupPrefix(ns: string): string | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	/** @internal */ lookupNamespace(prefix: string): string | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}

	private lookupNamespaceIndex(prefix: string): number {
		if (this.useNsHashtable) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			for (let i = this.nsTop; i >= 0; i--) {
				if (this.nsStack[i].prefix === prefix) {
					return i;
				}
			}
		}
		return -1;
	}

	private addNamespace(
		prefix: string,
		ns: string,
		kind: NamespaceKind,
	): void {
		const top = ++this.nsTop;
		if (top === this.nsStack.length) {
			const newStack: Namespace[] = new Array(top * 2);
			// OPTIMIZE
			for (let i = 0; i < top; i++) {
				newStack[i] = this.nsStack[i];
			}
			for (let i = top; i < newStack.length; i++) {
				newStack[i] = new Namespace();
			}
			this.nsStack = newStack;
		}
		this.nsStack[top].set(prefix, ns, kind);

		if (this.useNsHashtable) {
			// TODO
			throw new Error('Method not implemented.');
		} else if (this.nsTop === maxNamespacesWalkCount) {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	// PushNamespaceImplicit is called when a prefix/namespace pair is used in an element name, attribute name or some other qualified name.
	private pushNamespaceImplicit(prefix: string, ns: string): void {
		let kind: NamespaceKind;

		// See if the prefix is already defined
		const existingNsIndex = this.lookupNamespaceIndex(prefix);

		// Prefix is already defined
		if (existingNsIndex !== -1) {
			// It is defined in the current scope
			if (existingNsIndex > this.elemScopeStack[this.elemTop].prevNSTop) {
				// TODO
				throw new Error('Method not implemented.');
			}
			// The prefix is defined but in a different scope
			else {
				// existing declaration is special one (xml, xmlns) -> validate that the new one is the same and can be declared
				if (
					this.nsStack[existingNsIndex].kind === NamespaceKind.Special
				) {
					if (prefix === 'xml') {
						if (ns !== this.nsStack[existingNsIndex].namespaceUri) {
							throw new Error(
								'Prefix "xml" is reserved for use by XML and can be mapped only to namespace name "http://www.w3.org/XML/1998/namespace".' /* LOC */,
							);
						} else {
							kind = NamespaceKind.Implied;
						}
					} else {
						if (prefix !== 'xmlns') {
							throw new Error('Assertion failed.');
						}
						throw new Error(
							'Prefix "xmlns" is reserved for use by XML.' /* LOC */,
						);
					}
				}
				// regular namespace declaration -> compare the namespace Uris to decide if the prefix is redefined
				else {
					kind =
						this.nsStack[existingNsIndex].namespaceUri === ns
							? NamespaceKind.Implied
							: NamespaceKind.NeedToWrite;
				}
			}
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}

		this.addNamespace(prefix, ns, kind);
	}

	writeStartElement(
		prefix: string | undefined,
		localName: string,
		ns: string | undefined,
	): void {
		try {
			// check local name
			if (localName === undefined || localName.length === 0) {
				throw new Error(
					"The empty string '' is not a valid local name." /* LOC */,
				);
			}
			XmlWellFormedWriter.checkNCName(localName);

			this.advanceState(Token.StartElement);

			// lookup prefix / namespace
			if (prefix === undefined) {
				if (ns !== undefined) {
					prefix = this.lookupPrefix(ns);
				}
				prefix ??= '';
			} else if (prefix.length > 0) {
				XmlWellFormedWriter.checkNCName(prefix);
				ns ??= this.lookupNamespace(prefix);
				if (ns === undefined || (ns !== undefined && ns.length === 0)) {
					throw new Error(
						'Cannot use a prefix with an empty namespace.' /* LOC */,
					);
				}
			}
			if (ns === undefined) {
				ns = this.lookupNamespace(prefix);
				if (ns === undefined) {
					if (prefix.length !== 0) {
						throw new Error('Assertion failed.');
					}
					ns = '';
				}
			}

			if (this.elemTop === 0 && this.rawWriter !== undefined) {
				// notify the underlying raw writer about the root level element
				this.rawWriter.onRootElement(this.conformanceLevel);
			}

			// write start tag
			this.writer.writeStartElement(prefix, localName, ns);

			// push element on stack and add/check namespace
			const top = ++this.elemTop;
			if (top === this.elemScopeStack.length) {
				// TODO
				throw new Error('Method not implemented.');
			}
			this.elemScopeStack[top].set(prefix, localName, ns, this.nsTop);

			this.pushNamespaceImplicit(prefix, ns);

			if (this.attrCount >= maxAttrDuplWalkCount) {
				// TODO
				throw new Error('Method not implemented.');
			}
			this.attrCount = 0;
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	writeEndElement(): void {
		try {
			this.advanceState(Token.EndElement);

			let top = this.elemTop;
			if (top === 0) {
				throw new XmlError(
					'There was no XML start tag open.' /* LOC */,
				);
			}

			// write end tag
			if (this.rawWriter !== undefined) {
				this.elemScopeStack[top].writeEndElement(this.rawWriter);
			} else {
				this.writer.writeEndElement();
			}

			// pop namespaces
			const prevNsTop = this.elemScopeStack[top].prevNSTop;
			if (this.useNsHashtable && prevNsTop < this.nsTop) {
				this.popNamespaces(prevNsTop + 1, this.nsTop);
			}
			this.nsTop = prevNsTop;
			this.elemTop = --top;

			// check "one root element" condition for ConformanceLevel.Document
			if (top === 0) {
				if (this.conformanceLevel === ConformanceLevel.Document) {
					this.currentState = State.AfterRootEle;
				} else {
					this.currentState = State.TopLevel;
				}
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	private popNamespaces(indexFrom: number, indexTo: number): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	writeFullEndElement(): void {
		try {
			this.advanceState(Token.EndElement);

			let top = this.elemTop;
			if (top === 0) {
				throw new XmlError(
					'There was no XML start tag open.' /* LOC */,
				);
			}

			// write end tag
			if (this.rawWriter !== undefined) {
				this.elemScopeStack[top].writeFullEndElement(this.rawWriter);
			} else {
				this.writer.writeFullEndElement();
			}

			// pop namespaces
			const prevNsTop = this.elemScopeStack[top].prevNSTop;
			if (this.useNsHashtable && prevNsTop < this.nsTop) {
				this.popNamespaces(prevNsTop + 1, this.nsTop);
			}
			this.nsTop = prevNsTop;
			this.elemTop = --top;

			// check "one root element" condition for ConformanceLevel.Document
			if (top === 0) {
				if (this.conformanceLevel === ConformanceLevel.Document) {
					this.currentState = State.AfterRootEle;
				} else {
					this.currentState = State.TopLevel;
				}
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	private setSpecialAttribute(special: SpecialAttribute): void {
		this.specAttr = special;
		if (this.currentState === State.Attribute) {
			this.currentState = State.SpecialAttr;
		} else if (this.currentState === State.RootLevelAttr) {
			this.currentState = State.RootLevelSpecAttr;
		} else {
			throw new Error(
				'currentState === State.Attribute || currentState === State.RootLevelAttr',
			);
		}

		this.attrValueCache ??= new AttributeValueCache();
	}

	private lookupLocalNamespace(prefix: string): string | undefined {
		for (
			let i = this.nsTop;
			i > this.elemScopeStack[this.elemTop].prevNSTop;
			i--
		) {
			if (this.nsStack[i].prefix === prefix) {
				return this.nsStack[i].namespaceUri;
			}
		}
		return undefined;
	}

	private generatePrefix(): string {
		// TODO
		throw new Error('Method not implemented.');
	}

	private addAttribute(
		prefix: string,
		localName: string,
		namespaceName: string,
	): void {
		const top = this.attrCount++;
		if (top === this.attrStack.length) {
			// TODO
			throw new Error('Method not implemented.');
		}
		this.attrStack[top].set(prefix, localName, namespaceName);

		if (this.attrCount < maxAttrDuplWalkCount) {
			// check for duplicates
			for (let i = 0; i < top; i++) {
				if (
					this.attrStack[i].isDuplicate(
						prefix,
						localName,
						namespaceName,
					)
				) {
					throw new XmlError(/* TODO: message */);
				}
			}
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	writeStartAttribute(
		prefix: string | undefined,
		localName: string,
		namespaceName: string | undefined,
	): void {
		try {
			// check local name
			if (localName === undefined || localName.length === 0) {
				if (prefix === 'xmlns') {
					localName = 'xmlns';
					prefix = '';
				} else {
					throw new Error(
						`The empty string '' is not a valid local name.` /* LOC */,
					);
				}
			}

			XmlWellFormedWriter.checkNCName(localName);

			this.advanceState(Token.StartAttribute);

			// lookup prefix / namespace
			if (prefix === undefined) {
				if (namespaceName !== undefined) {
					// special case prefix=null/localname=xmlns
					if (
						!(
							localName === 'xmlns' &&
							namespaceName === XmlReservedNs.NsXmlNs
						)
					) {
						prefix = this.lookupPrefix(namespaceName);
					}
				}

				prefix ??= '';
			}
			if (namespaceName === undefined) {
				if (prefix.length > 0) {
					namespaceName = this.lookupNamespace(prefix);
				}
				namespaceName ??= '';
			}

			SkipPushAndWrite: do {
				if (prefix.length === 0) {
					if (localName[0] === 'x' && localName === 'xmlns') {
						if (
							namespaceName.length > 0 &&
							namespaceName !== XmlReservedNs.NsXmlNs
						) {
							throw new Error(
								'Prefix "xmlns" is reserved for use by XML.' /* LOC */,
							);
						}
						this.curDeclPrefix = '';
						this.setSpecialAttribute(SpecialAttribute.DefaultXmlns);
						break SkipPushAndWrite;
					} else if (namespaceName.length > 0) {
						prefix = this.lookupPrefix(namespaceName);
						if (prefix === undefined || prefix.length === 0) {
							prefix = this.generatePrefix();
						}
					}
				} else {
					if (prefix[0] === 'x') {
						// TODO
						throw new Error('Method not implemented.');
					}

					XmlWellFormedWriter.checkNCName(prefix);

					if (prefix.length === 0) {
						// attributes cannot have default namespace
						prefix = '';
					} else {
						const definedNs = this.lookupLocalNamespace(prefix);
						if (
							definedNs !== undefined &&
							definedNs !== namespaceName
						) {
							prefix = this.generatePrefix();
						}
					}
				}

				if (prefix.length !== 0) {
					this.pushNamespaceImplicit(prefix, namespaceName);
				}
			} while (false);

			// add attribute to the list and check for duplicates
			this.addAttribute(prefix, localName, namespaceName);

			if (this.specAttr === SpecialAttribute.No) {
				// write attribute name
				this.writer.writeStartAttribute(
					prefix,
					localName,
					namespaceName,
				);
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	// PushNamespaceExplicit is called when a namespace declaration is written out;
	// It returns true if the namespace declaration should we written out, false if it should be omitted (if OmitDuplicateNamespaceDeclarations is true)
	private pushNamespaceExplicit(prefix: string, ns: string): boolean {
		let writeItOut = true;

		// See if the prefix is already defined
		const existingNsIndex = this.lookupNamespaceIndex(prefix);

		// Existing declaration in the current scope
		if (existingNsIndex !== -1) {
			// It is defined in the current scope
			if (existingNsIndex > this.elemScopeStack[this.elemTop].prevNSTop) {
				// The new namespace Uri needs to be the same as the one that is already declared
				if (this.nsStack[existingNsIndex].namespaceUri !== ns) {
					throw new XmlError(/* TODO: message */);
				}
				// Check for duplicate declarations
				const existingNsKind = this.nsStack[existingNsIndex].kind;
				if (existingNsKind === NamespaceKind.Written) {
					throw new XmlError(/* TODO: message */);
				}
				// Check if it can be omitted
				if (
					this.omitDuplNamespaces &&
					existingNsKind !== NamespaceKind.NeedToWrite
				) {
					writeItOut = false;
				}
				this.nsStack[existingNsIndex].kind = NamespaceKind.Written;
				// No additional work needed
				return writeItOut;
			}
			// The prefix is defined but in a different scope
			else {
				// check if is the same and can be omitted
				if (
					this.nsStack[existingNsIndex].namespaceUri === ns &&
					this.omitDuplNamespaces
				) {
					writeItOut = false;
				}
			}
		}
		// No existing declaration found in the namespace stack
		else {
			// TODO
			throw new Error('Method not implemented.');
		}

		// validate special declaration (xml, xmlns)
		if (
			(ns === XmlReservedNs.NsXml && prefix !== 'xml') ||
			(ns === XmlReservedNs.NsXmlNs && prefix !== 'xmlns')
		) {
			throw new Error(
				`Prefix '${prefix}' cannot be mapped to namespace name reserved for "xml" or "xmlns".` /* LOC */,
			);
		}
		if (prefix.startsWith('x')) {
			if (prefix === 'xml') {
				if (ns !== XmlReservedNs.NsXml) {
					throw new Error(
						'Prefix "xml" is reserved for use by XML and can be mapped only to namespace name "http://www.w3.org/XML/1998/namespace".' /* LOC */,
					);
				}
			} else if (prefix === 'xmlns') {
				throw new Error(
					'Prefix "xmlns" is reserved for use by XML.' /* LOC */,
				);
			}
		}

		this.addNamespace(prefix, ns, NamespaceKind.Written);

		return writeItOut;
	}

	writeEndAttribute(): void {
		try {
			this.advanceState(Token.EndAttribute);

			if (this.specAttr !== SpecialAttribute.No) {
				if (this.attrValueCache === undefined) {
					throw new Error('Method not implemented.');
				}
				let value: string;

				switch (this.specAttr) {
					case SpecialAttribute.DefaultXmlns:
						value = this.attrValueCache.stringValue;
						if (this.pushNamespaceExplicit('', value)) {
							// returns true if the namespace declaration should be written out
							if (this.rawWriter !== undefined) {
								if (
									this.rawWriter
										.supportsNamespaceDeclarationInChunks
								) {
									// TODO
									throw new Error('Method not implemented.');
								} else {
									this.rawWriter.writeNamespaceDeclaration(
										'',
										value,
									);
								}
							} else {
								// TODO
								throw new Error('Method not implemented.');
							}
						}
						this.curDeclPrefix = undefined;
						break;
					case SpecialAttribute.PrefixedXmlns:
						// TODO
						throw new Error('Method not implemented.');
					case SpecialAttribute.XmlSpace:
						// TODO
						throw new Error('Method not implemented.');
					case SpecialAttribute.XmlLang:
						// TODO
						throw new Error('Method not implemented.');
				}
				this.specAttr = SpecialAttribute.No;
				this.attrValueCache.clear();
			} else {
				this.writer.writeEndAttribute();
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	writeCData(text: string | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	writeComment(text: string | undefined): void {
		try {
			text ??= '';
			this.advanceState(Token.Comment);
			this.writer.writeComment(text);
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	writeWhitespace(ws: string | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	writeString(text: string | undefined): void {
		try {
			if (text === undefined) {
				return;
			}

			this.advanceState(Token.Text);
			if (this.saveAttrValue) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.attrValueCache!.writeString(text);
			} else {
				this.writer.writeString(text);
			}
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}

	get writeState(): WriteState {
		if (this.currentState <= State.Error) {
			return state2WriteState[
				this.currentState as keyof typeof state2WriteState
			];
		} else {
			throw new Error('Expected currentState <= State.Error ');
		}
	}

	close(): void {
		if (this.currentState !== State.Closed) {
			try {
				if (this.writeEndDocumentOnClose) {
					while (
						this.currentState !== State.Error &&
						this.elemTop > 0
					) {
						this.writeEndElement();
					}
				} else {
					if (this.currentState !== State.Error && this.elemTop > 0) {
						//finish the start element tag '>'
						try {
							this.advanceState(Token.EndElement);
						} catch (error) {
							this.currentState = State.Error;
							throw error;
						}
					}
				}

				if (this.inBase64 && this.rawWriter !== undefined) {
					this.rawWriter.writeEndBase64();
				}

				this.writer.flush();
			} finally {
				try {
					if (this.rawWriter !== undefined) {
						this.rawWriter.closeWithWriteState(this.writeState);
					} else {
						this.writer.close();
					}
				} finally {
					this.currentState = State.Closed;
				}
			}
		}
	}

	flush(): void {
		try {
			this.writer.flush();
		} catch (error) {
			this.currentState = State.Error;
			throw error;
		}
	}
}
