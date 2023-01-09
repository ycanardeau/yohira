import { Type } from '@yohira/base/Type';
import { inject } from '@yohira/extensions.dependency-injection.abstractions/inject';
import { ILogger } from '@yohira/extensions.logging.abstractions/ILogger';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions/ILoggerFactory';
import { ILoggerT } from '@yohira/extensions.logging.abstractions/ILoggerT';
import { LogLevel } from '@yohira/extensions.logging.abstractions/LogLevel';

// https://source.dot.net/#Microsoft.Extensions.Logging.Abstractions/LoggerT.cs,ad0e78976f8400a9,references
export class LoggerT<T> implements ILoggerT<T> {
	private readonly logger: ILogger;

	constructor(@inject(Type.from('ILoggerFactory')) factory: ILoggerFactory) {
		this.logger = factory.createLogger('' /* TODO */);
	}

	log = (
		logLevel: LogLevel,
		message?: any,
		...optionalParams: any[]
	): void => {
		this.logger.log(logLevel, message, ...optionalParams);
	};

	isEnabled = (logLevel: LogLevel): boolean => {
		return this.logger.isEnabled(logLevel);
	};
}
