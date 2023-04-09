import { StringWriter, XElement } from '@yohira/base';

import { Secret } from '../Secret';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/XmlEncryption/XmlEncryptionExtensions.cs,57d7ea3d786f2233,references
export function toSecret(element: XElement): Secret {
	const writer = new StringWriter();
	element.save(writer);

	return new Secret(Buffer.from(writer.toString()));
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/XmlEncryption/XmlEncryptionExtensions.cs,a98fefb7f2b3901f,references
export function toXElement(secret: Secret): XElement {
	// TODO
	throw new Error('Method not implemented.');
}
