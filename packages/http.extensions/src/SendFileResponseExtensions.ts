import { IFileInfo } from '@yohira/extensions.file-providers';
// TODO: Do not import @yohira/http.
import { HttpContext } from '@yohira/http';
import { IHttpResponse } from '@yohira/http.abstractions';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/SendFileResponseExtensions.cs,46a23828b29f9242,references
async function sendFileCore(
	response: IHttpResponse,
	fileName: string,
	offset: number,
	count: number | undefined,
	// TODO: cancellationToken
): Promise<void> {
	// TODO
	const { nativeResponse } = response.httpContext as HttpContext;
	const stats = await stat(fileName);
	nativeResponse.writeHead(response.statusCode, {
		'Content-Length': stats.size,
		'Content-Type': response.contentType,
	});
	const readStream = createReadStream(fileName);
	readStream.pipe(nativeResponse);
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/SendFileResponseExtensions.cs,7f1df561b7c6874a,references
export async function sendFile(
	response: IHttpResponse,
	file: IFileInfo,
	offset: number,
	count: number | undefined,
	// TODO: cancellationToken
): Promise<void> {
	if (!file.physicalPath?.trim()) {
		throw new Error('Method not implemented.');
	} else {
		await sendFileCore(
			response,
			file.physicalPath,
			offset,
			count,
			// TODO: cancellationToken
		);
	}
}
