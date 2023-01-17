import { Type } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';

import { ILogger } from './ILogger';
import { ILoggerFactory } from './ILoggerFactory';
import { ILoggerT } from './ILoggerT';
import { LogLevel } from './LogLevel';

// https://source.dot.net/#Microsoft.Extensions.Logging.Abstractions/LoggerT.cs,ad0e78976f8400a9,references
export class LoggerT<T> implements ILoggerT<T> {
	private readonly logger: ILogger;

	constructor(@inject(Type.from('ILoggerFactory')) factory: ILoggerFactory) {
		this.logger = factory.createLogger('' /* TODO */);
	}

	log(logLevel: LogLevel, message?: any, ...optionalParams: any[]): void {
		this.logger.log(logLevel, message, ...optionalParams);
	}

	isEnabled(logLevel: LogLevel): boolean {
		return this.logger.isEnabled(logLevel);
	}
}
