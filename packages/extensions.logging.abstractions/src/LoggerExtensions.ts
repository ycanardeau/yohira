import { ILogger } from '@yohira/extensions.logging.abstractions/ILogger';
import { LogLevel } from '@yohira/extensions.logging.abstractions/LogLevel';

export const logDebug = (
	logger: ILogger,
	message?: any,
	...optionalParams: any[]
): void => {
	logger.log(LogLevel.Debug, message, ...optionalParams);
};
