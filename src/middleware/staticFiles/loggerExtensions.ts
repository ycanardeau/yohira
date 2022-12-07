import { ILogger } from '@/logging/ILogger';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,10e3cf5b010f8900,references
export const logRequestMethodNotSupported = (
	logger: ILogger,
	method: string,
): void => {
	logger.debug(`${method} requests are not supported`);
};

export const logPathMismatch = (logger: ILogger, path: string): void => {
	logger.debug(`The request path ${path} does not match the path filter`);
};

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,f2c41a9493102814
export const logFileTypeNotSupported = (
	logger: ILogger,
	path: string,
): void => {
	logger.debug(
		`The request path ${path} does not match a supported file type`,
	);
};