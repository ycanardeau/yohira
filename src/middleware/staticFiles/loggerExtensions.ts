import { ILogger } from '@/logging/ILogger';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/LoggerExtensions.cs,10e3cf5b010f8900,references
export const logRequestMethodNotSupported = (
	logger: ILogger,
	method: string,
): void => {
	logger.debug(`${method} requests are not supported`);
};
