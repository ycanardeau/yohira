import { MemoryStream } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { RangeItemHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';

import { FileContentResult } from '../FileContentResult';
import { FileResult } from '../FileResult';
import { FileResultExecutorBase } from './FileResultExecutorBase';
import { IActionResultExecutor } from './IActionResultExecutor';

function logWritingRangeToBody(logger: ILogger): void {
	logger.log(
		LogLevel.Debug,
		'Writing the requested range of bytes to the body...',
	);
}

function logExecutingFileResultWithNoFileName(
	logger: ILogger,
	fileResultType: string,
	fileDownloadName: string,
): void {
	logger.log(
		LogLevel.Information,
		`Executing ${fileResultType}, sending file with download name '${fileDownloadName}' ...`,
	);
}

function logExecutingFileResult(logger: ILogger, fileResult: FileResult): void {
	if (logger.isEnabled(LogLevel.Information)) {
		logExecutingFileResultWithNoFileName(
			logger,
			'' /* TODO: fileResultType */,
			fileResult.fileDownloadName,
		);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/FileContentResultExecutor.cs,f6e98c56202fc192,references
/**
 * A {@link IActionResultExecutor<FileContentResult>}
 */
export class FileContentResultExecutor
	extends FileResultExecutorBase
	implements IActionResultExecutor<FileContentResult>
{
	/**
	 * Intializes a new {@link FileContentResultExecutor}.
	 */
	constructor(@inject(ILoggerFactory) loggerFactory: ILoggerFactory) {
		super(
			FileContentResultExecutor.createLogger(
				FileContentResultExecutor,
				loggerFactory,
			),
		);
	}

	protected writeFile(
		context: ActionContext,
		result: FileContentResult,
		range: RangeItemHeaderValue | undefined,
		rangeLength: number,
	): Promise<void> {
		if (range !== undefined && rangeLength === 0) {
			return Promise.resolve();
		}

		if (range !== undefined) {
			logWritingRangeToBody(this.logger);
		}

		const fileContentStream = MemoryStream.from(
			result.fileContents,
			0,
			result.fileContents.length,
		);
		return FileResultExecutorBase.writeFile(
			context.httpContext,
			fileContentStream,
			range,
			rangeLength,
		);
	}

	execute(context: ActionContext, result: FileContentResult): Promise<void> {
		logExecutingFileResult(this.logger, result);

		const { range, rangeLength, serveBody } = this.setHeadersAndLog(
			context,
			result,
			result.fileContents.length,
			result.enableRangeProcessing,
			result.lastModified,
			result.entityTag,
		);

		if (!serveBody) {
			return Promise.resolve();
		}

		return this.writeFile(context, result, range, rangeLength);
	}
}
