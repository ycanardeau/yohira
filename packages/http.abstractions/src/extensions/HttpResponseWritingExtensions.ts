import { ServerResponse } from 'node:http';

import { IHttpResponse } from '../IHttpResponse';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/HttpResponseWritingExtensions.cs,ea3864b7132786fa,references
export function write(
	response: IHttpResponse,
	text: string,
	encoding: BufferEncoding = 'utf8',
): Promise<void> {
	return new Promise((resolve) => {
		// REVIEW
		const body = response.body as ServerResponse;
		body.statusCode = response.statusCode;
		body.write(text, encoding);
		body.end(resolve);
	});
}
