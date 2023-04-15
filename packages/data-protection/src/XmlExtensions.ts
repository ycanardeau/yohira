import { XElement } from '@yohira/xml';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/XmlExtensions.cs,dc834ef44b2ce789,references
export function withoutChildNodes(element: XElement): XElement {
	const newElement = XElement.fromName(element.name);
	for (const attr of element.attributes()) {
		newElement.setAttributeValue(attr.name, attr.value);
	}
	return newElement;
}
