import { ILogger } from '@/ILogger';
import { LogLevel } from '@/LogLevel';

export function logDebug(
	logger: ILogger,
	message?: any,
	...optionalParams: any[]
): void {
	logger.log(LogLevel.Debug, message, ...optionalParams);
}
