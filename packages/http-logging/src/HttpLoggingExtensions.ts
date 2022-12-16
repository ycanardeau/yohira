import { HttpLoggingMiddleware } from '@yohira/http-logging/HttpLoggingMiddleware';
import { HttpRequestLog } from '@yohira/http-logging/HttpRequestLog';
import { ILogger } from '@yohira/logging.abstractions/ILogger';
import { LogLevel } from '@yohira/logging.abstractions/LogLevel';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingExtensions.cs,5183288c97b153d3,references
export const logRequestLog = (
	logger: ILogger<HttpLoggingMiddleware>,
	requestLog: HttpRequestLog,
): void => {
	logger.log(LogLevel.Information, requestLog.toString());
};
