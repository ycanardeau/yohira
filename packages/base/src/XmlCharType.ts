import { charProperties } from './charProperties';

const whitespace = 1;
const ncStartNameSC = 4;
const ncNameSC = 8;
const charData = 16;
const text = 64;
const attrValue = 128;

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlCharType.cs,91fd86dd249a310f,references
export function isWhiteSpace(ch: number): boolean {
	return (charProperties[ch] & whitespace) !== 0;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlCharType.cs,86fe399c08939eeb,references
export function isNCNameSingleChar(ch: number): boolean {
	return (charProperties[ch] & ncNameSC) !== 0;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlCharType.cs,7bb9b2768789de22,references
export function isStartNCNameSingleChar(ch: number): boolean {
	return (charProperties[ch] & ncStartNameSC) !== 0;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlCharType.cs,e75f7a49a6715e08,references
export function isNameSingleChar(ch: number): boolean {
	return isNCNameSingleChar(ch) || ch === ':'.charCodeAt(0);
}

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlCharType.cs,9e7eafbd8cafb3b8,references
export function isCharData(ch: number): boolean {
	return (charProperties[ch] & charData) != 0;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlCharType.cs,48f20a3cac8cd2dd,references
// TextChar = CharData - { 0xA, 0xD, '<', '&', ']' }
export function isTextChar(ch: number): boolean {
	return (charProperties[ch] & text) !== 0;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlCharType.cs,cd027f7d1064733d,references
// AttrValueChar = CharData - { 0xA, 0xD, 0x9, '<', '>', '&', '\'', '"' }
export function isAttributeValueChar(ch: number): boolean {
	return (charProperties[ch] & attrValue) !== 0;
}
