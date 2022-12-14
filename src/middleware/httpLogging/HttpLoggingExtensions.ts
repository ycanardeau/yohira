import { HttpLoggingMiddleware } from '@/middleware/httpLogging/HttpLoggingMiddleware';
import { HttpRequestLog } from '@/middleware/httpLogging/HttpRequestLog';
import { ILogger, LogLevel } from '@yohira/logging';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingExtensions.cs,5183288c97b153d3,references
export const logRequestLog = (
	logger: ILogger<HttpLoggingMiddleware>,
	requestLog: HttpRequestLog,
): void => {
	logger.log(LogLevel.Information, requestLog.toString());
};
