import { ILogger } from '@yohira/extensions.logging.abstractions/ILogger';
import { LogLevel } from '@yohira/extensions.logging.abstractions/LogLevel';
import { HttpLoggingMiddleware } from '@yohira/http-logging/HttpLoggingMiddleware';
import { HttpRequestLog } from '@yohira/http-logging/HttpRequestLog';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingExtensions.cs,5183288c97b153d3,references
export const logRequestLog = (
	logger: ILogger<HttpLoggingMiddleware>,
	requestLog: HttpRequestLog,
): void => {
	logger.log(LogLevel.Information, requestLog.toString());
};
