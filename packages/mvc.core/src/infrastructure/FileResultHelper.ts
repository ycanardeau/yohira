import { ILogger, LogLevel } from '@yohira/extensions.logging.abstractions';
import { IHttpContext, isHead } from '@yohira/http.abstractions';
import {
	EntityTagHeaderValue,
	RangeItemHeaderValue,
} from '@yohira/http.headers';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { FileResultInfo } from './FileResultInfo';

function logNotEnabledForRangeProcessing(logger: ILogger): void {
	logger.log(
		LogLevel.Debug,
		"The file result has not been enabled for processing range requests. To enable it, set the EnableRangeProcessing property on the result to 'true'.",
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/src/Shared/ResultsHelpers/FileResultHelper.cs,da837f27cbb1a1a8,references
export async function writeFile(
	context: IHttpContext,
	fileStream: Readable,
	range: RangeItemHeaderValue | undefined,
	rangeLength: number,
): Promise<void> {
	const outputStream = context.response.body;
	// TODO: using $ = fileStream;
	{
		// TODO: try
		if (range === undefined) {
			await pipeline(fileStream, outputStream as Writable);
		} else {
			throw new Error('Method not implemented.');
		}
		// TODO: catch
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/src/Shared/ResultsHelpers/FileResultHelper.cs,dee20ccd0dfc6f9a,references
export function setHeadersAndLog(
	httpContext: IHttpContext,
	result: FileResultInfo,
	fileLength: number | undefined,
	enableRangeProcessing: boolean,
	lastModified: Date /* TODO: DateTimeOffset */ | undefined,
	etag: EntityTagHeaderValue | undefined,
	logger: ILogger,
): {
	range: RangeItemHeaderValue | undefined;
	rangeLength: number;
	serveBody: boolean;
} {
	const request = httpContext.request;
	// TODO: const httpRequestHeaders = request.headers;

	// TODO: implement

	/* TODO: const preconditionState = getPreconditionState(
		httpRequestHeaders,
		lastModified,
		etag,
		logger,
	); */

	const response = httpContext.response;

	// TODO: implement

	if (fileLength !== undefined) {
		// Assuming the request is not a range request, and the response body is not empty, the Content-Length header is set to
		// the length of the entire file.
		// If the request is a valid range request, this header is overwritten with the length of the range as part of the
		// range processing (see method SetContentLength).

		response.contentLength = fileLength;

		// Handle range request
		if (enableRangeProcessing) {
			throw new Error('Method not implemented.');
		} else {
			logNotEnabledForRangeProcessing(logger);
		}
	}

	return {
		range: undefined,
		rangeLength: 0,
		serveBody: !isHead(request.method),
	};
}
