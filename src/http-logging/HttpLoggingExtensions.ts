import { HttpLoggingMiddleware } from '@/http-logging/HttpLoggingMiddleware';
import { HttpRequestLog } from '@/http-logging/HttpRequestLog';
import { ILogger } from '@/logging.abstractions/ILogger';
import { LogLevel } from '@/logging.abstractions/LogLevel';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingExtensions.cs,5183288c97b153d3,references
export const logRequestLog = (
	logger: ILogger<HttpLoggingMiddleware>,
	requestLog: HttpRequestLog,
): void => {
	logger.log(LogLevel.Information, requestLog.toString());
};
