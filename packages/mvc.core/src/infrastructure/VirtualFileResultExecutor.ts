import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	IFileInfo,
	IFileProvider,
	NullFileProvider,
} from '@yohira/extensions.file-providers';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { IWebHostEnv } from '@yohira/hosting.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import { sendFile } from '@yohira/http.extensions';
import { RangeItemHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';

import { FileResult } from '../FileResult';
import { VirtualFileResult } from '../VirtualFileResult';
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
		`[LoggerMessage(1, LogLevel.Information, "Executing ${fileResultType}, sending file '${fileDownloadPath}' with download name '${fileDownloadName}' ...`,
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

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/VirtualFileResultExecutor.cs,ed41231f7d0b1e7a,references
export class VirtualFileResultExecutor
	extends FileResultExecutorBase
	implements IActionResultExecutor<VirtualFileResult>
{
	constructor(
		@inject(ILoggerFactory) loggerFactory: ILoggerFactory,
		@inject(IWebHostEnv) private readonly hostingEnv: IWebHostEnv,
	) {
		super(
			FileResultExecutorBase.createLogger(
				VirtualFileResult,
				loggerFactory,
			),
		);
	}

	/** @internal */ static getFileProvider(
		result: VirtualFileResult,
		hostingEnv: IWebHostEnv,
	): IFileProvider {
		if (result.fileProvider !== undefined) {
			return result.fileProvider;
		}

		result.fileProvider = hostingEnv.webRootFileProvider;
		return result.fileProvider;
	}

	/** @internal */ static getFileInformation(
		result: VirtualFileResult,
		hostingEnv: IWebHostEnv,
	): IFileInfo {
		const fileProvider = this.getFileProvider(result, hostingEnv);
		if (fileProvider instanceof NullFileProvider) {
			throw new Error(
				'No file provider has been configured to process the supplied file.' /* LOC */,
			);
		}

		let normalizedPath = result.fileName;
		if (normalizedPath.startsWith('~')) {
			normalizedPath = normalizedPath.substring(1);
		}

		const fileInfo = fileProvider.getFileInfoSync(normalizedPath);
		return fileInfo;
	}

	/** @internal */ static writeFileInternal(
		httpContext: IHttpContext,
		fileInfo: IFileInfo,
		range: RangeItemHeaderValue | undefined,
		rangeLength: number,
		logger: ILogger,
	): Promise<void> {
		if (range !== undefined && rangeLength === 0) {
			return Promise.resolve();
		}

		const response = httpContext.response;

		if (range !== undefined) {
			logWritingRangeToBody(logger);
		}

		if (range !== undefined) {
			return sendFile(response, fileInfo, range.from ?? 0, rangeLength);
		}

		return sendFile(response, fileInfo, 0, undefined);
	}

	protected writeFile(
		context: ActionContext,
		result: VirtualFileResult,
		fileInfo: IFileInfo,
		range: RangeItemHeaderValue | undefined,
		rangeLength: number,
	): Promise<void> {
		return VirtualFileResultExecutor.writeFileInternal(
			context.httpContext,
			fileInfo,
			range,
			rangeLength,
			this.logger,
		);
	}

	execute(context: ActionContext, result: VirtualFileResult): Promise<void> {
		const fileInfo = VirtualFileResultExecutor.getFileInformation(
			result,
			this.hostingEnv,
		);
		if (!fileInfo.existsSync()) {
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
			return this.writeFile(
				context,
				result,
				fileInfo,
				range,
				rangeLength,
			);
		}

		return Promise.resolve();
	}
}
