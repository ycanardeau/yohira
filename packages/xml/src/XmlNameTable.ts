// https://source.dot.net/#System.Private.Xml/System/Xml/XmlNameTable.cs,bceca5abce95baab,references
export abstract class XmlNameTable {
	abstract getString(array: string): string | undefined;
	abstract addChars(array: number[], offset: number, length: number): string;
	abstract addString(array: string): string | undefined;
}
