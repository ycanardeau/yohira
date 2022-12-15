import { IFileInfo } from '@yohira/file-providers';
import { HttpContext, StatusCodes } from '@yohira/http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';

import { IHttpContext } from './IHttpContext';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpResponse.cs,7642421540ea6ef2,references
export interface IHttpResponse {
	/**
	 * Gets the {@link IHttpContext} for this response.
	 */
	readonly httpContext: IHttpContext;
	/**
	 * Gets or sets the HTTP response code.
	 */
	statusCode: StatusCodes;
	/**
	 * Gets or sets the value for the <c>Content-Type</c> response header.
	 */
	contentType: string | undefined;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/SendFileResponseExtensions.cs,46a23828b29f9242,references
const sendFileCore = async (
	response: IHttpResponse,
	fileName: string,
	offset: number,
	count: number | undefined,
	// TODO: cancellationToken
): Promise<void> => {
	// TODO
	const { nativeResponse } = response.httpContext as HttpContext;
	const stats = await stat(fileName);
	nativeResponse.writeHead(response.statusCode, {
		'Content-Length': stats.size,
		'Content-Type': response.contentType,
	});
	const readStream = createReadStream(fileName);
	readStream.pipe(nativeResponse);
};

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/SendFileResponseExtensions.cs,7f1df561b7c6874a,references
export const sendFile = async (
	response: IHttpResponse,
	file: IFileInfo,
	offset: number,
	count: number | undefined,
	// TODO: cancellationToken
): Promise<void> => {
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
};