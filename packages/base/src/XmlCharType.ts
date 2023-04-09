import { charProperties } from './charProperties';

// Surrogate constants
export const surHighStart = 0xd800; // 1101 10xx
export const surHighEnd = 0xdbff;
export const surLowStart = 0xdc00; // 1101 11xx
export const surLowEnd = 0xdfff;
export const surMask = 0xfc00; // 1111 11xx

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

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlCharType.cs,ef9cb4fc6946d35a,references
// This method tests whether a value is in a given range with just one test; start and end should be constants
function inRange(value: number, start: number, end: number): boolean {
	if (start > end) {
		throw new Error('Assertion failed.');
	}
	return value - start <= end - start;
}

// https://source.dot.net/#System.Private.Xml/System/Xml/XmlCharType.cs,808c344f58e85ca8,references
export function isSurrogate(ch: number): boolean {
	return inRange(ch, surHighStart, surLowEnd);
}
