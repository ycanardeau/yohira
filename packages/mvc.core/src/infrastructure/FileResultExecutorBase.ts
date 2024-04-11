import { Ctor } from '@yohira/base';
import {
	ILogger,
	ILoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import {
	EntityTagHeaderValue,
	RangeItemHeaderValue,
} from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';
import { Readable } from 'node:stream';

import { FileResult } from '../FileResult';
import { setHeadersAndLog, writeFile } from './FileResultHelper';
import { FileResultInfo } from './FileResultInfo';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/FileResultExecutorBase.cs,afacac7c941fc1f3,references
/**
 * Base class for executing a file result.
 */
export class FileResultExecutorBase {
	/**
	 * Intializes a new {@link FileResultExecutorBase}.
	 * @param logger The logger.
	 */
	constructor(
		/**
		 * The logger to use.
		 */
		protected readonly logger: ILogger,
	) {}

	protected setHeadersAndLog(
		context: ActionContext,
		result: FileResult,
		fileLength: number | undefined,
		enableRangeProcessing: boolean,
		lastModified: Date /* DateTimeOffset */ | undefined = undefined,
		etag: EntityTagHeaderValue | undefined = undefined,
	): {
		range: RangeItemHeaderValue | undefined;
		rangeLength: number;
		serveBody: boolean;
	} {
		const fileResultInfo = ((): FileResultInfo => {
			const fileResultInfo = new FileResultInfo();
			fileResultInfo.contentType = result.contentType;
			fileResultInfo.enableRangeProcessing = result.enableRangeProcessing;
			fileResultInfo.entityTag = result.entityTag;
			fileResultInfo.fileDownloadName = result.fileDownloadName;
			fileResultInfo.lastModified = result.lastModified;
			return fileResultInfo;
		})();

		return setHeadersAndLog(
			context.httpContext,
			fileResultInfo,
			fileLength,
			enableRangeProcessing,
			lastModified,
			etag,
			this.logger,
		);
	}

	/**
	 * Creates a logger using the factory.
	 * @param ctor The type being logged.
	 * @param factory The {@link ILoggerFactory}.
	 * @returns An {@link ILogger}.
	 */
	protected static createLogger<T>(
		ctor: Ctor<T>,
		factory: ILoggerFactory,
	): ILogger {
		return factory.createLogger(ctor.name);
	}

	protected static async writeFile(
		context: IHttpContext,
		fileStream: Readable,
		range: RangeItemHeaderValue | undefined,
		rangeLength: number,
	): Promise<void> {
		await writeFile(context, fileStream, range, rangeLength);
	}
}
