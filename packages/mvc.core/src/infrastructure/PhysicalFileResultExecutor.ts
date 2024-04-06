import { FileInfo, isPathRooted } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import { sendFileCore } from '@yohira/http.extensions';
import { RangeItemHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';

import { FileResult } from '../FileResult';
import { PhysicalFileResult } from '../PhysicalFileResult';
import { FileResultExecutorBase } from './FileResultExecutorBase';
import { IActionResultExecutor } from './IActionResultExecutor';

function logWritingRangeToBody(logger: ILogger): void {
	logger.log(
		LogLevel.Debug,
		'Writing the requested range of bytes to the body...',
	);
}

function logExecutingFileResultCore(
	logger: ILogger,
	fileResultType: string,
	fileDownloadPath: string,
	fileDownloadName: string,
): void {
	logger.log(
		LogLevel.Information,
		`Executing ${fileResultType}, sending file '${fileDownloadPath}' with download name '${fileDownloadName}' ...`,
	);
}

function logExecutingFileResult(
	logger: ILogger,
	fileResult: FileResult,
	fileName: string,
): void {
	if (logger.isEnabled(LogLevel.Information)) {
		logExecutingFileResultCore(
			logger,
			'' /* TODO: fileResultType */,
			fileName,
			fileResult.fileDownloadName,
		);
	}
}

/**
 * Represents metadata for a file.
 */
class FileMetadata {
	constructor(
		/**
		 * Whether a file exists.
		 */
		public exists: boolean,
		/**
		 * The file length.
		 */
		public length: number,
		/**
		 * When the file was last modified.
		 */
		public lastModified: Date /* TODO: DateTimeOffset */,
	) {}
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/PhysicalFileResultExecutor.cs,d0f051ab7daf2463,references
/**
 * A {@link IActionResultExecutor<PhysicalFileResult>} for {@link PhysicalFileResult}.
 */
export class PhysicalFileResultExecutor
	extends FileResultExecutorBase
	implements IActionResultExecutor<PhysicalFileResult>
{
	/**
	 * Initializes a new instance of {@link PhysicalFileResultExecutor}.
	 * @param loggerFactory The factory used to create loggers.
	 */
	constructor(@inject(ILoggerFactory) loggerFactory: ILoggerFactory) {
		super(
			FileResultExecutorBase.createLogger(
				PhysicalFileResultExecutor,
				loggerFactory,
			),
		);
	}

	protected getFileInfo(path: string): FileMetadata {
		const fileInfo = new FileInfo(path);

		// It means we are dealing with a symlink and need to get the information
		// from the target file instead.
		/* TODO: if (fileInfo.existsSync() && !!fileInfo.linkTarget) {
			throw new Error('Method not implemented.');
		} */

		return new FileMetadata(
			fileInfo.existsSync(),
			fileInfo.length,
			fileInfo.lastWriteTimeUtc,
		);
	}

	/** @internal */ static async writeFileInternal(
		httpContext: IHttpContext,
		result: PhysicalFileResult,
		range: RangeItemHeaderValue | undefined,
		rangeLength: number,
		logger: ILogger,
	): Promise<void> {
		if (range !== undefined && rangeLength === 0) {
			return Promise.resolve();
		}

		const response = httpContext.response;
		if (!isPathRooted(result.fileName)) {
			throw new Error(
				`Path '${result.fileName}' was not rooted.` /* LOC */,
			);
		}

		if (range !== undefined) {
			logWritingRangeToBody(logger);
		}

		if (range !== undefined) {
			return sendFileCore(
				response,
				result.fileName,
				range.from ?? 0,
				rangeLength,
			);
		}

		return sendFileCore(response, result.fileName, 0, undefined);
	}

	protected writeFile(
		context: ActionContext,
		result: PhysicalFileResult,
		range: RangeItemHeaderValue | undefined,
		rangeLength: number,
	): Promise<void> {
		return PhysicalFileResultExecutor.writeFileInternal(
			context.httpContext,
			result,
			range,
			rangeLength,
			this.logger,
		);
	}

	execute(context: ActionContext, result: PhysicalFileResult): Promise<void> {
		const fileInfo = this.getFileInfo(result.fileName);
		if (!fileInfo.exists) {
			throw new Error(
				`Could not find file: ${result.fileName}.` /* LOC */,
			);
		}

		logExecutingFileResult(this.logger, result, result.fileName);

		const lastModified = result.lastModified ?? fileInfo.lastModified;
		const { range, rangeLength, serveBody } = this.setHeadersAndLog(
			context,
			result,
			fileInfo.length,
			result.enableRangeProcessing,
			lastModified,
			result.entityTag,
		);

		if (serveBody) {
			return this.writeFile(context, result, range, rangeLength);
		}

		return Promise.resolve();
	}
}
