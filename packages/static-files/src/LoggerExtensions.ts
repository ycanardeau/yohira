import { StaticFileMiddleware } from '@/StaticFileMiddleware';
import { ILoggerT, LogLevel } from '@yohira/extensions.logging.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,e84a4b406304d9b0,references
function logFileServedCore(
	logger: ILoggerT<StaticFileMiddleware>,
	virtualPath: string,
	physicalPath: string,
): void {
	logger.log(
		LogLevel.Information,
		`Sending file. Request path: '${virtualPath}'. Physical path: '${physicalPath}'`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,64fe8c23a73b59bd,references
export function logFileServed(
	logger: ILoggerT<StaticFileMiddleware>,
	virtualPath: string,
	physicalPath: string,
): void {
	if (!physicalPath.trim()) {
		physicalPath = 'N/A';
	}
	logFileServedCore(logger, virtualPath, physicalPath);
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,3068b930094bf334,references
export function logEndpointMatched(
	logger: ILoggerT<StaticFileMiddleware>,
): void {
	logger.log(
		LogLevel.Debug,
		'Static files was skipped as the request already matched an endpoint.',
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,10e3cf5b010f8900,references
export function logRequestMethodNotSupported(
	logger: ILoggerT<StaticFileMiddleware>,
	method: string,
): void {
	logger.log(LogLevel.Debug, `${method} requests are not supported`);
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,e240e32d569094bc,references
export function logPathMismatch(
	logger: ILoggerT<StaticFileMiddleware>,
	path: string,
): void {
	logger.log(
		LogLevel.Debug,
		`The request path ${path} does not match the path filter`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,f2c41a9493102814,references
export function logFileTypeNotSupported(
	logger: ILoggerT<StaticFileMiddleware>,
	path: string,
): void {
	logger.log(
		LogLevel.Debug,
		`The request path ${path} does not match a supported file type`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,f6541ac130cc9584,references
export function logFileNotFound(
	logger: ILoggerT<StaticFileMiddleware>,
	path: string,
): void {
	logger.log(
		LogLevel.Debug,
		`The request path ${path} does not match an existing file`,
	);
}
