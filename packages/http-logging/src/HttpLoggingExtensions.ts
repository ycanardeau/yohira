import { ILogger, LogLevel } from '@yohira/extensions.logging.abstractions';

import { HttpRequestLog } from './HttpRequestLog';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingExtensions.cs,5183288c97b153d3,references
export function logRequestLog(
	logger: ILogger,
	requestLog: HttpRequestLog,
): void {
	logger.log(LogLevel.Information, requestLog.toString());
}
