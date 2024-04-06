import { Stream } from '@yohira/base';
import { ILogger } from '@yohira/extensions.logging.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import {
	EntityTagHeaderValue,
	RangeItemHeaderValue,
} from '@yohira/http.headers';

import { FileResultInfo } from './FileResultInfo';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/src/Shared/ResultsHelpers/FileResultHelper.cs,da837f27cbb1a1a8,references
export function writeFile(
	context: IHttpContext,
	fileStream: Stream,
	range: RangeItemHeaderValue | undefined,
	rangeLength: number,
): Promise<void> {
	throw new Error('Method not implemented.');
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
	range: RangeItemHeaderValue;
	rangeLength: number;
	serveBody: boolean;
} {
	throw new Error('Method not implemented.');
}
