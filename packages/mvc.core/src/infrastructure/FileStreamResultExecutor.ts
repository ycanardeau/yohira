import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { RangeItemHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';

import { FileResult } from '../FileResult';
import { FileStreamResult } from '../FileStreamResult';
import { FileResultExecutorBase } from './FileResultExecutorBase';
import { IActionResultExecutor } from './IActionResultExecutor';

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

function logWritingRangeToBody(logger: ILogger): void {
	logger.log(
		LogLevel.Debug,
		'Writing the requested range of bytes to the body...',
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/FileStreamResultExecutor.cs,e3229ddd1baad3bf,references
/**
 * An {@link IActionResultExecutor<FileStreamResult>} for a file stream result.
 */
export class FileStreamResultExecutor
	extends FileResultExecutorBase
	implements IActionResultExecutor<FileStreamResult>
{
	/**
	 * Initializes a new {@link FileStreamResultExecutor}.
	 * @param loggerFactory The factory used to create loggers.
	 */
	constructor(@inject(ILoggerFactory) loggerFactory: ILoggerFactory) {
		super(
			FileResultExecutorBase.createLogger(
				FileStreamResultExecutor,
				loggerFactory,
			),
		);
	}

	protected writeFile(
		context: ActionContext,
		result: FileStreamResult,
		range: RangeItemHeaderValue | undefined,
		rangeLength: number,
	): Promise<void> {
		if (range !== undefined && rangeLength === 0) {
			return Promise.resolve();
		}

		if (range !== undefined) {
			logWritingRangeToBody(this.logger);
		}

		return FileResultExecutorBase.writeFile(
			context.httpContext,
			result.fileStream,
			range,
			rangeLength,
		);
	}

	async execute(
		context: ActionContext,
		result: FileStreamResult,
	): Promise<void> {
		using fileStream = result.fileStream;
		{
			logExecutingFileResult(this.logger, result);

			let fileLength: number | undefined;
			if (fileStream.canSeek) {
				fileLength = fileStream.length;
			}

			const { range, rangeLength, serveBody } = this.setHeadersAndLog(
				context,
				result,
				fileLength,
				result.enableRangeProcessing,
				result.lastModified,
				result.entityTag,
			);

			if (!serveBody) {
				return;
			}

			await this.writeFile(context, result, range, rangeLength);
		}
	}
}
