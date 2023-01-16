import { LogLevel } from '@/LogLevel';

// https://source.dot.net/#Microsoft.Extensions.Logging.Abstractions/ILogger.cs,0976525f5d1b9e54,references
export interface ILogger {
	log(logLevel: LogLevel, message?: any, ...optionalParams: any[]): void;
	isEnabled(logLevel: LogLevel): boolean;
}
