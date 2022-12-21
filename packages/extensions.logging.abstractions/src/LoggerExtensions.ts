import { ILogger } from '@yohira/extensions.logging.abstractions/ILogger';
import { LogLevel } from '@yohira/extensions.logging.abstractions/LogLevel';

export const logDebug = <T>(
	logger: ILogger<T>,
	message?: any,
	...optionalParams: any[]
): void => {
	logger.log(LogLevel.Debug, message, ...optionalParams);
};
