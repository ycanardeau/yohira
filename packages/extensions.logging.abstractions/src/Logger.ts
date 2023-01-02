import { ILogger } from '@yohira/extensions.logging.abstractions/ILogger';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions/ILoggerFactory';
import { LogLevel } from '@yohira/extensions.logging.abstractions/LogLevel';
import { inject } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Logging.Abstractions/LoggerT.cs,ad0e78976f8400a9,references
export class Logger<T> implements ILogger<T> {
	constructor(@inject('ILoggerFactory') factory: ILoggerFactory) {}

	log = (
		logLevel: LogLevel,
		message?: any,
		...optionalParams: any[]
	): void => {};

	isEnabled = (logLevel: LogLevel): boolean => {
		// TODO
		return true;
	};
}
