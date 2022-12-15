import { ILogger, LogLevel } from '@yohira/logging';

import { HttpLoggingMiddleware } from './HttpLoggingMiddleware';
import { HttpRequestLog } from './HttpRequestLog';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingExtensions.cs,5183288c97b153d3,references
export const logRequestLog = (
	logger: ILogger<HttpLoggingMiddleware>,
	requestLog: HttpRequestLog,
): void => {
	logger.log(LogLevel.Information, requestLog.toString());
};
