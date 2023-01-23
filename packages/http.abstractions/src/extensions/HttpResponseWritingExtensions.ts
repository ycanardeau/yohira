import { Writable } from 'node:stream';

import { IHttpResponse } from '../IHttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/HttpResponseWritingExtensions.cs,ea3864b7132786fa,references
export function write(
	response: IHttpResponse,
	text: string,
	encoding: BufferEncoding = 'utf8',
): Promise<void> {
	// TODO
	const body = response.body as Writable;
	body.write(text, encoding);
	body.end();
	return Promise.resolve();
}
