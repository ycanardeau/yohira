import { ILogger } from '@/logging/ILogger';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,10e3cf5b010f8900,references
export const logRequestMethodNotSupported = (
	logger: ILogger,
	method: string,
): void => {
	logger.debug(`${method} requests are not supported`);
};

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,e240e32d569094bc,references
export const logPathMismatch = (logger: ILogger, path: string): void => {
	logger.debug(`The request path ${path} does not match the path filter`);
};

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,f2c41a9493102814,references
export const logFileTypeNotSupported = (
	logger: ILogger,
	path: string,
): void => {
	logger.debug(
		`The request path ${path} does not match a supported file type`,
	);
};

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,f6541ac130cc9584,references
export const logFileNotFound = (logger: ILogger, path: string): void => {
	logger.debug(`The request path ${path} does not match an existing file`);
};
