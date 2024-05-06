import { ILogger } from './ILogger';
import { LogLevel } from './LogLevel';

export function logDebug(logger: ILogger, message: string): void {
	logger.log(LogLevel.Debug, message);
}
